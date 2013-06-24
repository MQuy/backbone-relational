Backbone Relational
=================

### Declaration ###
```
User = Backbone.RelationalModel.extend({
  relations: [{
		key: 'friends',
		collectionType: 'User',
		reverseRelation: {
			key: 'user',
			reference_id: 'user_id'
		}
	}]
});
```

### Usage ###

1.  Fetch Relation

```
user = new User({id: 1})
user.fetchRelated('friends', options) # like backbone
```

2.  Get Relation

```
user.getRelation('friends')
```

3.  Set Relation

```
user.setRelation('friends', obj)
```

4.  Trigger when success

```
user.on('add:friends', function() {})
```

### Upgrade for backbone ###
1.  Use update method when you only want pass specific params

```
user.update({status: 'online'})
```
