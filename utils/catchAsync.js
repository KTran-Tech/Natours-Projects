//fn stands for function(The function to which we would pass in)
module.exports = (fn) => {
  //returns a function that could be called for later rather than be used ASAP
  return (req, res, next) => {
    /* This catch method will make sure that the error is passed into
    the next function and then makes sure that it ends up in the 
    global error handling middleware (it's at the very bottom of App.js)*/
    fn(req, res, next).catch((err) => next(err));
  };
};
