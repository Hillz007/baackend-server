const User = require('../models/User');
const sendEmail = require ('../utils/sendEmail')


const register = async (req, res) => {
    const {email, password, firstname,lastname}= req.body;

    try {
        if(!email || !password || !firstname || !lastname ){
        return res. status(404).json({success: false, message: "Please input all fields"})
    }

    const existingUser = await User.findOne({email})
    if (existingUser){
    return res.status(401).json({success:false, message:"User already "})
    }

    // create user
    const user = await User.create({
        email,
        firstname,
        lastname,
        password
    });

const options = {
    email: email,
    subject:"welcome to my site",
    emailBody: `welcome ${firstname}`
}
 await sendEmail(options);

    //send response to the user
    res.status(201).json({success:true, message: "User created successfully"})
    } catch (error) {
        console.error("Something went wrong",error);
        res.status(500).json({error:"Something went wrong"});
    }

};

const login = async (req, res)=>{
    const {email, password} = req.body;


//validate email and password

if(!email || !password){
    return res.status(404).json({success: false, message: "Please input all the fields"})
}

//check for user
const user = await User.findOne({email}).select("+password")
if(!user){
    return res.status(401).json({success: false,message: "User does not exist"});
}

// check if password match 
const isMatch = await user.matchPassword(password);

if(!isMatch){
    return res.status(404).json({success: false, message: "Invalid password"});
}

res.status(200).json({success:true, message: "Login successful", data:user});
}

const deleteUser = async (req, res) => {
    const user = req.params.id;

    const checkIfUserExist = await User.findById(user);

    if (!checkIfUserExist){
        res.status (400).json ({success:false, message:"User does not exist"})
        await User.deleteOne({_id: req.params.id})
        res.status (200).json ({success: true, data: {}});
    }
}

const updateDetails = async (req, res) => {
    const fieldsToUpdate = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
    };
  
    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
  
    res.status(200).json({ success: true, data: user });
  };
  
  const updatePassword = async (req, res) => {
    const user = await User.findById(req.params.id).select("+password");
  
    // check currentPassword
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res
        .status(401)
        .json({ sucess: false, message: "Password is incorrect" });
    }
  
    user.password = req.body.newPassword;
    await user.save();
  
    res.status(200).json({ sucess: true, message: "Password updated" });
  };

const forgotPassword = async (req, res) => {
    
        const user = await User.findOne ({email: req.body.email})

        if(!user){
            return res.status(404).json({success: false, message: "there is no user with "})
        }

        const resetToken = user.getResetPasswordToken();

        await user.save ({validateBeforeSave:false});

        console.log(resetToken);

        // create reset url
        const resetUrl = `${req.protocol}:// ${req.get("host")}/api/v1/auth/resetPassword/${resetToken}`;

        const message = `You are receiving this email because you or someone else has requested the reset of a password. Please make a request to \n\n ${resetUrl}`;

const options = {
    email: user.email,
    subject: "Password reset Token",
    emailBody: message 
};
try{
    await sendEmail(options);

    return res.status(200).json({success:true, message: "Email sent"})
} catch (error) {
    console.log(error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire= undefined;

    await user.save ({validateBeforeSave: false});

    return res.status(500).json({success: false, message:"Something went wrong"});
}
  
}


const resetPassword = async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }
  
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    return res.status(200).json({success: true, message: "Password changed successfully", data: user});
  };
  


//npm i nodemailer
module.exports = {register, login,deleteUser, updatePassword,updateDetails,forgotPassword, resetPassword};
