import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
   
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500, // Corrected "max" to "maxlength"
    },
    img: {
      type: String, // Corrected "string" to "String"
      require: true
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
