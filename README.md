backbone-relation
=================

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
