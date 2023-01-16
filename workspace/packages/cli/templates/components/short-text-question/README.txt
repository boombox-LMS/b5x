USAGE

Use a short-text-question when your question could be answered with a few words or less.

REQUIRED ATTRIBUTES

None.

OPTIONAL ATTRIBUTES

id
DESCRIPTION: An identifier used to refer to this input elsewhere in the topic (such as in a <templated-value> tag)
ACCEPTED VALUE: A spinalcase identifier that is unique within the topic
EXAMPLE USAGE: id=reader-first-name

required
DESCRIPTION: Sets the question to required or not required. In tutorials, required questions will block the user's progress through the content, hiding any subsequent content.
DEFAULT VALUE: true
ACCEPTED VALUES: true, false
EXAMPLE USAGE: required=false

ALLOWED CONTENTS

The short-text-question tag can contain any desired static content (Markdown, images, non-input components, etc).

EXAMPLE USAGE

<short-text-question id='reader-name'>
What is your name?
</short-text-question>