module.exports = (fn) => {
  //returns a function that could be called for later rather than be used ASAP
  return (req, res, next) => {
    //if you pass in something it will automatically know its an error inside of next() and pass it to the global error middleware
    fn(req, res, next).catch(next);
  };
};
