# Parser documentation notes

## Tags

Regular HTML tags appearing in Markdown content (`<code>`, `<table>`, etc.) will be parsed as HTML. But Boombox Markdown can contain _fragment tags_ as well, such as `<short-text-question>` or `<system-diagram>`.

Each fragment tag is parsed by whatever class has been designated to parse it in the `FragmentBuilder` class. The parsing class might be the generic `Fragment` class, the slightly less generic `StatefulFragment` class, or a specific class designed for that tag type (e.g., `MultiSelectQuestion`).

Some tags, such as the `<choice>` tag that appears inside of a `<multi-select-question>` tag, can be thought of as "internal use only" -- they are not parsed individually by a class because their parent tags remove them from the parsing tree after extracting data from them. To continue with the example of the `<choice>` tag, the contents of that tag will wind up inside of the `MultiSelectQuestion` instance's `data` attribute, so it can be rendered by the app.

## Fragment parsing steps

1. Inside the `Document` class, the entire document file is parsed with an HTML/XML parsing library, creating a tree.
2. The `Document` class iterates over the tree in order to parse its nodes into Boombox fragments.
3. Plain Markdown / plain HTML content is parsed as `HtmlContent` fragments.
4. When a fragment tag is encountered, such as `<single-select-question>`, the tag (which also contains all of its children, none of whom have been parsed yet) is passed by the `Document` class to the `FragmentBuilder` class.
5. The `FragmentBuilder` class determines which fragment class to initialize (e.g., `SingleSelectQuestion`) for the tag. Not every fragment type needs its own fragment class. For example, the `five-star-rating` fragment is parsed by the generic `Fragment` class, because its contents don't require any unique modification before they are passed to the web app as data. Compare this to the `troubleshooter` tag, which contains several unique internal tags that need to be converted into data, requiring a dedicated `Troubleshooter` class to run that operation.
6. The `FragmentBuilder` initializes an instance of the appropriate fragment class.
7. During initialization, the fragment class has a few jobs. A key job is deciding what to do with each child tags:

- A child tag might be kept, in which case it will be parsed next by the `FragmentBuilder` as its own fragment.
- A child tag might be modified (unpacked into valid HTML, for example).
- A child tag may also have its attributes or contents extracted into the fragment's `data` attribute, then be removed completely from the parsing tree. The `troubleshooter`, for example, contains `step` tags that are not valid HTML and should not be rendered anywhere -- their information belongs in the `data` attribute of the `troubleshooter` tag, so the `Troubleshooter` fragment class discards the tags themselves once their information is extracted into `data`.

8. Once a fragment has been initialized, the `Document` moves on to using the `FragmentBuilder` to parse any tags still listed in the newly parsed fragment's `childTags` attribute (which contains any children the fragment decided to retain). These children are parsed individually according to the same process described above, just like any other fragment. Once they've been created, the `Document` attaches the array of parsed fragments to the parent fragment as the parent fragment's `childFragments` attribute. It may feel a bit odd to ask a fragment for its child tags, parse them as `Fragment` instances, and hand them back to the parent `Fragment` instance, but this structure avoids requiring `Fragment` and `FragmentBuilder` to import one another, creating a circular dependency error.
