import { Schema, model, models, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { 
    type: String, 
    required: [true, "কোর্সের শিরোনাম অবশ্যই দিতে হবে"],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, "কোর্সের বিবরণ অবশ্যই দিতে হবে"],
    trim: true
  },
  videoUrl: { 
    type: String, 
    required: [true, "ভিডিও URL অবশ্যই দিতে হবে"],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, "কোর্সের মূল্য অবশ্যই দিতে হবে"],
    min: [0, "মূল্য নেতিবাচক হতে পারবে না"],
    default: 0
  },
  category: { 
    type: String, 
    required: [true, "কোর্সের ক্যাটাগরি অবশ্যই দিতে হবে"],
    trim: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CourseSchema.index({ category: 1 });
CourseSchema.index({ createdAt: -1 });

export const Course = (models.Course as Model<ICourse>) || model<ICourse>("Course", CourseSchema);
