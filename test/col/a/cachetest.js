var cache = require('memory-cache');
 
// now just use the cache 
 
cache.put('foo', 'bar');
cache.put('ele', 'phant');
console.log(cache.get('foo'))
 
cache.put('houdini', 'disappear', 100) // Time in ms 
console.log('Houdini will now ' + cache.get('houdini'));
 
