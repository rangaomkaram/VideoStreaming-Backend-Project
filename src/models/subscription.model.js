import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new Schema(
    {
        

    }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)