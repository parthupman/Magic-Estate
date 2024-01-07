import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import  jwt  from "jsonwebtoken";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body; 
    const hashedPassword =  bcryptjs.hashSync(password, 12);
    const newUser = new User({ username, email, password:hashedPassword });
    try {
        await newUser.save()
        res.status(201).json('User created successfully');
    } catch (error) {
        next(error);
    }
    
}                                   

export const signin = async (req,res,next) => {
    const { email, password } = req.body;
    try {
        const validUser = await User.findOne({ email });
        if(!validUser) return next(errorHandler('User not found', 404));
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword) return next(errorHandler('Invalid password', 401));
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); 
        const {password:pass, ...rest} = validUser._doc;
        res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
    } catch (error) {
        next(error); 
    }
}