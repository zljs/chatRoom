module.exports = function(app){
  require('./login')(app);
  require('./room')(app);
  require('./list')(app);
  require('./logout')(app);
  require('./register')(app);

};
