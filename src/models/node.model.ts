import { Schema, model, Types } from 'mongoose';

export type NodeType = 'office' | 'store';

export interface INode {
  name: string;
  type: NodeType;
  parent: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
}

const nodeSchema = new Schema<INode>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['office', 'store'], required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Node', default: null },
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Node', index: true }],
  },
  { timestamps: true },
);

export const NodeModel = model<INode>('Node', nodeSchema);