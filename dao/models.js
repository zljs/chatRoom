module.exports = {
    user: {
        name : {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        userid :{
            type: String,
            required: true
        }
    },
    message : {
        content:String,
        from: String,
        to:String,
        // required: true
    }
}
