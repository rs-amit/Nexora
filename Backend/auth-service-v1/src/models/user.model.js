import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    refreshToken: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
)

/*
Hash password before saving
*/
userSchema.pre("save", async function () {

  if (!this.isModified("password")) return

  this.password = await bcrypt.hash(this.password, 10)

})

/*
Compare password
*/
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)