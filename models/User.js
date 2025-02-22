const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const  crypto = require('crypto')

const UserSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: [true, "Please add your first name"],
            maxlength: [50,"Name cannot be more than 50"]
        },
        lastname: {
            type: String,
            required: [true, "Please add your last name"],
            maxlength: [50,"Name cannot be more than 50"]
        },
        email:{
            type: String,
            required: [true, "Please provide an email"],
            unique: [true, "User already exist"],
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please add a valid email"]
        },
        password:{
            type: String,
            required: [true, "Please add a password"],
            minlength:8,
            select:false
        },
        
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastPasswordReset: Date,
    },
    {
        timestamps: true,
    }
)

//Encrypt password using bcrypt
UserSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }

const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);

})

// match user entered password to hashed password in the database
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//Generate and hass password token
UserSchema.methods.getResetPasswordToken = function (){
    //generate token 
    const resetToken = crypto.randomBytes(20).toString("hex");
try{
// Hash token and set to resetPasswordToken field
this,resetPasswordToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex");

// set expire
this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

return resetToken;
}catch (error){
    // Handle error
    console.error("Error generating reset password token:",error);
    throw new Error ("Failed to generate reset password token");
}

}



module.exports = mongoose.model("User", UserSchema);