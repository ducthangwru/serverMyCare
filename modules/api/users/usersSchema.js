const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const usersSchema = new Schema(
    {
        username : {type : String, require : true},
        password : {type : String, require : true},
        fullname : {type : String, require : true},
        dateofbirth : {type : String},
        tokenfirebase : {type: String},
        avatar : {type: String},
        email : {type : String},
        status : {type : Boolean}
    }, {timestamps : {createAt : 'created_at', updateAt : 'updated_at'}}
);

let usersModel = mongoose.model('users', usersSchema);

usersSchema.pre('save', function(next) {
    let user = this;
    usersModel.find({username : user.username}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            console.log('user exists: ',user.username);
            next(new Error("User exists!"));
        }
    });
});


module.exports = usersSchema;