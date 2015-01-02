var User = AV.Object.extend('_User');

function findUser(queryFn) {
  var q = new AV.Query(User);
  queryFn.call(this, q);
  return q.first();
}

function findUserByName(name){
  return findUser(function(q){
    q.equalTo('username',name)
  });
}

exports.findUserByName=findUserByName;
