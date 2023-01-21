# Boombox backend server (@b5x/api)

## Responsibilities

- Receive new topic data from the viewer app
- Encrypt and store topic data and assets
  - Storage may be in the filesystem, a database, S3, Redis, etc.
- Retrieve/assemble topic data and assets when given the relevant identifiers
- Verify user access to a given resource by
  - Calculating the access-control rules for a given user's security groups
  - Verifying that the user has completed any required prerequisites for a given piece of content
- Manage incoming topic updates, such as auto-migrating users to the newest non-breaking topic version
- Manage ongoing versioning of topics
- Store user data, such as a user's responses to inputs within topics

## Key submodules

### DatabaseConnectionBuilder

Creates a [Knex](https://knexjs.org/guide/) connection to a new or existing Boombox LMS database.

### AppBuilder

Given an existing Knex connection, creates an instance of an Express app that uses the Knex connection to store and retrieve topics and other Boombox data.

### BoomboxDataManager

Given an existing Knex connection, manages the low-level implementation of all Knex queries against Boombox data, including creating new table rows in the database, caching repeat requests in Redis, and queueing nonblocking requests with [Bull](https://github.com/OptimalBits/bull).