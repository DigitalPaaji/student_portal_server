import mongoose, { Document, model, Schema } from "mongoose";


interface IFollowup extends Document{
leadId:mongoose.Types.ObjectId;
createBy:mongoose.Types.ObjectId;
followupData:Date;
upcomingfoll:Date;
leadStatus:string;
note:string;

}



const Followupschema = new Schema<IFollowup>({
    leadId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"StudentLead",
        required:true

    },
     followupData:{
        type:Date,
        required:true
     },
     upcomingfoll:{
        type:Date,
        default:null},

       leadStatus:{
        type:String,
        default:"new"
       },
     createBy:{
           type:mongoose.Schema.Types.ObjectId,
        ref:"superadmin",
        required:true
     },

note:{
type:String,
}

},{
    timestamps:true
})


const FollowUp =  model<IFollowup>("followups",Followupschema);


export default FollowUp;
