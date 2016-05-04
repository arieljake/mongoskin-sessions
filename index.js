var EventEmitter = require('events').EventEmitter;

var oneDay = 86400;

module.exports = function(ExpressSession)
{
	var Store = ExpressSession.Store;
	
	return function(mongoskin, options)
	{
		var that = {
			__proto__: Store.prototype
		};

		options = options || {};
		options.collection = options.collection || "sessions";

		var sessions = mongoskin.collection(options.collection);

		that.get = function(sid, cb)
		{
			sessions.find(
			{
				sid: sid
			}).toArray(function(err, sessions)
			{
				if (err)
					return cb(err);

				if (!sessions || sessions.length === 0)
					return cb();

				return cb(null, sessions[0].data);
			});
		};

		that.set = function(sid, session, cb)
		{
			sessions.update(
				{
					sid: sid
				},
				{
					sid: sid,
					data: session
				},
				{
					upsert: true
				},
				function(err, result)
				{
					if (err)
						return cb(err);

					cb.apply(null, arguments);
				});
		};

		that.destroy = function(sid, cb)
		{
			sessions.remove(
			{
				sid: sid
			},
			{
				safe: false
			}, cb);
		};

		that.clear = function(cb)
		{
			sessions.drop(cb);
		};

		that.touch = function(sid, session, cb)
		{
			cb();
		};

		that.length = function(cb)
		{
			sessions.count(cb);
		};

		return that;
	};
};