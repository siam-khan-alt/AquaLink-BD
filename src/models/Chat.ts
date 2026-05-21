import { Schema, model, models, Document, Model } from "mongoose";

export interface IChat extends Document {
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: Schema.Types.ObjectId;
  participants: Schema.Types.ObjectId[];
  isAdminSupport: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  isGroup: {
    type: Boolean,
    default: false,
    required: true,
  },
  groupName: {
    type: String,
    required: function(this: IChat) {
      return this.isGroup;
    },
  },
  groupAdmin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function(this: IChat) {
      return this.isGroup;
    },
  },
  participants: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: true,
    validate: {
      validator: function(v: Schema.Types.ObjectId[]) {
        return v && v.length >= 2;
      },
      message: "Chat must have at least 2 participants",
    },
  },
  isAdminSupport: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ChatSchema.index({ participants: 1 });
ChatSchema.index({ isAdminSupport: 1 });
ChatSchema.index({ groupAdmin: 1 });

export const Chat = (models.Chat as Model<IChat>) || model<IChat>("Chat", ChatSchema);
