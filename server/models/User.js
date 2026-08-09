const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    timezone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
    type: Boolean,
    default: false,
},
    availability: [
    {
        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ],
        },
        startTime: {
            type: String,
        },
        endTime: {
            type: String,
        },
    },
],
  },
  {
    timestamps: true,
  }
  
);
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    },
});

module.exports = mongoose.model("User", userSchema);