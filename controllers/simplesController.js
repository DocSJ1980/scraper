// Importing express server, router, middleware i.e. fetchuser, models i.e. Notes and express validator
import SimpleActivity from "../models/simplesModel.js"
import ErrorResponse from "../utils/Error.js"

//FIRST ROUTE: Get all the simple activities
export const fetchAllSimpleActivities = async (req, res, next) => {
    try {
        const simpleActivity = await SimpleActivity.findOne({}, {}, { sort: { dateSubmitted: -1 } });
        res.json(simpleActivity.dateSubmitted);
    } catch (error) {
        res.json("2022-08-31T19:00:00.000Z")
    }
};

//SECOND ROUTE: Add simple activity
export const newSimpleActivity = async (req, res, next) => {
    //Implementing try/catch block to avoid any errors or unexpected behaviour
    try {

        const { pitbid, district, town, uc, department, tag, larvaFound, dengueLarva, lat, long, beforePic, afterPic, timeDiff, userName, dateSubmitted, bogus } = req.body
        // console.log(dateSubmitted)
        const location = { coordinates: [long, lat] }
        const activitySub = await SimpleActivity.findOne({ pitbid: pitbid });
        if (activitySub) {
            res.json({ "message": "Activity already exisits", activitySub });
        }
        if (!activitySub) {
            const simpleActivity = await SimpleActivity.create({ pitbid, district, town, uc, department, tag, larvaFound, dengueLarva, location, beforePic, afterPic, timeDiff, userName, dateSubmitted, bogus });
            res.json(`Activity Submitted against pitbid: ${simpleActivity.pitbid}`);
        }

    }
    //Try statement completed, now catching errors if above not successful.
    catch (error) {
        return next(new ErrorResponse("Failed to submit simple activity", 400))
    }
}

//THIRD ROUTE: Update an existing simple activity
export const updateSimpleActivity = async (req, res, next) => {
    const { pitbid, district, town, uc, department, tag, larvaFound, dengueLarva, location, beforePic, afterPic, timeDiff, userName, dateSubmitted, bogus } = req.body;
    //Implementing try/catch block to avoid any errors or unexpected behaviour
    try {
        //Create new note object
        const tmpSimpleActivity = {};
        if (pitbid) { tmpSimpleActivity.pitbid = pitbid };
        if (district) { tmpSimpleActivity.district = district };
        if (town) { tmpSimpleActivity.town = town };
        if (uc) { tmpSimpleActivity.uc = uc };
        if (department) { tmpSimpleActivity.department = department };
        if (tag) { tmpSimpleActivity.tag = tag };
        if (larvaFound) { tmpSimpleActivity.larvaFound = larvaFound };
        if (dengueLarva) { tmpSimpleActivity.dengueLarva = dengueLarva };
        if (location) { tmpSimpleActivity.location = location };
        if (beforePic) { tmpSimpleActivity.beforePic = beforePic };
        if (afterPic) { tmpSimpleActivity.afterPic = afterPic };
        if (timeDiff) { tmpSimpleActivity.timeDiff = timeDiff };
        if (userName) { tmpSimpleActivity.userName = userName };
        if (dateSubmitted) { tmpSimpleActivity.dateSubmitted = dateSubmitted };
        if (bogus) { tmpSimpleActivity.bogus = bogus };

        //Find the note to be updated and store
        let simpleActivity = await SimpleActivity.findById(req.params.id);

        //Check if note belongs to logged in user and check if no note found
        if (!simpleActivity) { return res.status(404).send("Not Found") }

        //if above condtions found true then update the note and return in response 
        const updatedSimpleActivity = await Notes.findByIdAndUpdate(req.params.id, { $set: tmpSimpleActivity }, { new: true })
        res.json({ updatedSimpleActivity });
    }
    //Try statement completed, now catching errors if above not successful.
    catch (error) {
        return next(new ErrorResponse("Failed to update simple activity", 400))
    }
}
//FOURTH ROUTE: Update an existing simple Activity
export const deleteSimpleActivity = async (req, res) => {
    try {
        let simpleActivity = await SimpleActivity.findById(req.params.id);
        if (!simpleActivity) { return res.status(404).send("Not Found") }

        const deletedSimpleActivity = await SimpleActivity.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Simple Activity has been deleted", note: note });
    }
    //Try statement completed, now catching errors if above not successful.
    catch (error) {
        return next(new ErrorResponse("Failed to delete simple activity", 400))
    }
}

// Fifth Route: batch submit simples activities
export const batchSimples = async (req, res, next) => {
    const { allActivities } = req.body
    // console.log(allActivities)
    try {
        // const insertedSimples = await SimpleActivity.insertMany(allActivities)
        const countActivities = allActivities.length
        let i = 0
        let notSubmitted = 0
        let activitySubmitted = 0
        while (i < countActivities) {
            try {
                await SimpleActivity.create(allActivities[i])
                activitySubmitted++
                console.log("Submitted: ", activitySubmitted)
            } catch (error) {
                notSubmitted++
                console.log("Not Submitte: ", notSubmitted)
            }
            i++
        }
        return res.status(200).json(`Activities submitted = ${activitySubmitted} Activities not submitted = ${notSubmitted}`)
    } catch (error) {
        return next(new ErrorResponse("Failed to batch submit simple activities", 400))
    }
}