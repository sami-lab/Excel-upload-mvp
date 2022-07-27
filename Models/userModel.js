const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

var UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A User must have a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "A User must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please Provide a Valid Email"],
    },

    password: {
      type: String,

      required: [true, "A User must have a Password"],
      minlength: [
        5,
        "A User Password must have more or equal then 5 characters",
      ],
      validate: {
        validator: function (val) {
          return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/.test(
            val
          );
        },
        message:
          "Password must contain at least 5 digits with one uppercase and one special letter.",
      },
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please Enter Confirm Password"],
      validate: {
        //Only work For Create or Save
        validator: function (val) {
          return val === this.password;
        },
        message: "Confirm Password Did not match with Password!!!",
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
UserSchema.pre("save", async function (next) {
  //hashing password
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
// UserSchema.post('init', function (doc) {
//   console.log(
//     '%s has been initialized from the db',
//     doc.id,
//     crypto.createHash('Sha256').update(doc.id).digest('hex')
//   );
//   doc.fake = crypto.createHash('Sha256').update(doc.id).digest('hex');
//   return doc
// });
// UserSchema.pre(/^find/, async function (next) {
//   console.log(this._id);
//   this.id = crypto.createHash('Sha256').update(this._id).digest('hex');
//   this._id = undefined;
//   next();
// });
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createEmailVerificationToken = function () {
  const Token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("Sha256")
    .update(Token)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 2 * 60 * 60 * 1000;
  return Token;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
