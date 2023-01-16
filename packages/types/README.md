# Boombox LMS types (@b5x/types)

## Responsibilities

- House any TypeScript interfaces shared by more than one Boombox module, to ensure that these modules are aligned.
  - For example, the data structure of a b5x-cli content fragment should match the expectations of both b5x-api (for storage and retrieval) and b5x-viewer (for rendering).
- Provide (Zod)[https://github.com/colinhacks/zod] schema validators for any shared TypeScript interfaces.
  - Unlike TypeScript interfaces, Zod schemas can validate data at runtime. This is especially important in the validation of user-provided markup, where an unsupported tag might be present or a required tag attribute might be missing.

## Additional context

`@b5x/types` was created during the migration of most of the codebase to TypeScript. Because the codebase was not originally designed in TypeScript (i.e., with no sense of whether the data representing a given entity was exactly identical across different apps and packages), many of the types here can be consolidated or simplified.

Pulling all of these types into one package has been helpful in identifying areas to clean up, but eventually this package should have fewer types as the result of refactoring.

## Conventions

### Definitions

All types begin as Zod schemas, with the TypeScript type inferred from the Zod schema definition:

```
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email()
});

export type User = z.infer<typeof UserSchema>;
```

This pattern enables use cases beyond TypeScript checking:

- Validating parsed user markup at runtime, with detailed error messages
- Data structure validation in tests (expected properties, expected return values, etc.)
- Easy generation of complex/lengthy mock data to decrease reliance on test databases/test database seeding

### Naming

#### Type suffixes

- TypeScript interfaces are named directly after the resource they describe: `Topic`.
- Zod schema names end in `Schema`: `TopicSchema`.

#### Type prefixes

- `Raw` (e.g., `RawTopic`) represents a newly built entity that has not yet been stored or retrieved. During storage, it may be broken up across multiple tables, and when retrieved, it may not contain all of the data it originally did, since some of the data is just for up-front processing use.
- `New` is an insertable database row. These are only used for the initial storage of an entity.
- `Saved` is usually a saved database row, or the closest approximation of one (in cases when content "rows" are broken up further under the hood for efficiency reasons).
- `Expanded` represents multiple database rows that have been pulled together because the data is related.
  - For example, an `ExpandedDocument` also contains all of its content fragments, even though the fragments are stored separately from the document in the database.
- `Public` is a version of the type that has had sensitive or invalid information removed for client-side rendering or similar.
  - For example, a Date object might become a datetime string in a public data type, since a Date object cannot be returned by an HTTP API.
  - The public version of a type may also include additional data resulting from calculations that are faster to run on the server than on the client, such as a progress percentage.
