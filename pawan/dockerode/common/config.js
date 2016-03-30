

var config = {
	// __sess_dir can be made an argument but then it won't probably be absolute path
	session_dir : '/home/pawan/vcnew/wvc/common/session/v2' ,
	mount_name : '/session' ,
	image : 'wiziq/session:v2.2' ,
	internal_port : '3179' ,
};



module.exports = config;
