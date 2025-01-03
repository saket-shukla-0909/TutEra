const Chat = require("../modals/chatModals");







exports.allChatUser = async(req, res)=>{
    try{    
        const keyword = req.query.search ? {
            $or: [
                { name: {$regex: req.query.search, $options:"i"}},
                { email: {$regex: req.query.search, $options:"i"}},
            ]
        }:{};
        const chatUser = await Chat.find({_id: { $ne: req.chatUser._id }});
        res.status(200).send(chatUser);
        console.log(keyword)
    }catch(error){
        console.log(error);
        res.status(500).send('Internal server error');
    }
}