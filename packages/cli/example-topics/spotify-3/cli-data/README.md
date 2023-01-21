# The cli-data/shipped folder

After a successful publishing operation, the CLI will drop a `.b5x` file (a JSON file that represents the fully compiled topic data sent to the API) in `cli-data/shipped`.

It's optional to check these files into version control or save them as backups, since they could easily be recreated by the CLI anytime from a given git SHA anyway. But the files can be helpful to refer to for debugging purposes, if your published or drafted topic is not behaving as expected.

Aside from the blank `.keep` file that ensures the directory exists in version control, the contents of `cli-data/shipped` are ignored by git by default. If you would like to check your `.b5x` files into version control for whatever reason, simply update or remove the topic's `cli-data/shipped/.gitignore` file.
