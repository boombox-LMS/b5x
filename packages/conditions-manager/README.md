# Boombox LMS conditions manager (@b5x/conditions-manager)

[View test coverage report](https://boombox-lms.github.io/b5x/coverage/conditions-manager)

## Responsibilities

- Parse user-authored conditions (e.g., `user-favorite-color is hot-pink`) into machine-readable conditions.
- Modify existing sets of conditions by adding a condition, replacing temporary identifiers with permanent ones, and so on.
- When given a set of user data and a set of conditions, determine whether the user has satisfied the conditions.

## Key submodules

### ConditionsChecker

Determine whether the user has satisfied a given set of conditions.

### ConditionsManager

Parse user-authored conditions and modify existing sets of conditions. This module currently lives in b5x-cli, but will be migrated to b5x-conditions-manager in order to allow all conditions-impacting modules to be tested together and kept in sync.
