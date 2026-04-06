import mongoose,{Schema,Document} from "mongoose";

export interface IJobs extends Document {
    title:string,
    description:string,
    salaray:{
        min:number,
        max:number,
        currency:string
    },
    location:string,
    status:"active" | "closed" | "draft",
    postedBy:mongoose.Types.ObjectId,
    createdAt:Date,
    updatedAt:Date,
    jobType: "full-time" | "part-time" | "remote" | "hybrid",
    skills:string[],
    company:string
}

const jobSchema=new Schema<IJobs>(
    {

    }
)

export const Job = mongoose.models.Job || 
mongoose.model<IJobs>("Job", jobSchema)