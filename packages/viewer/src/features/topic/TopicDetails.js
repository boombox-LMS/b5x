import React from "react";
import { Link } from "react-router-dom";
import { TagCloud } from "../tags/TagCloud";

export const TopicDetails = ({ topic, header }) => {
  const tags = [
    "sadly",
    "tags",
    "have",
    "not",
    "been",
    "implemented",
    "yet",
    "but",
    "soon",
    "so please",
    "just",
    "be patient",
    "ok",
    "also",
    "these",
    "colors",
    "are not",
    "final",
    "either",
    "so relax",
    "about it",
  ];

  if (!header) {
    header = topic.title;
  }

  return (
    <>
      <img src={topic.coverImageUrl} />

      <h1>{header}</h1>
      <p>{topic.subtitle}</p>

      <h2>Details</h2>
      <p>
        This is the fake long description / commercial / sell. Eventually it
        will be real! It will be set up as a file in the main directory of each
        topic, and can contain bullets etc. It can contain skills covered as
        well, which initally will be hard-coded into the topic contents but
        eventually can be derived from tags.
      </p>

      <p>
        Since the detailed description is in Markdown instead of YAML, it can
        contain images, links, etc.
      </p>

      <h3>Intended audience</h3>
      <p>Anyone who is interested in the content features of this LMS.</p>

      <h3>Skills covered</h3>
      <ul>
        <li>Skills would</li>
        <li>go right here</li>
        <li>if they existed</li>
        <li>but they don't</li>
        <li>(at least</li>
        <li>not yet)</li>
      </ul>

      <h2>Prerequisites</h2>
      {topic.prerequisites.length === 0 && <p>None</p>}
      {topic.prerequisites.length > 0 && (
        /* TODO: Show which prereqs the user has already completed */
        <ul>
          {topic.prerequisites.map((prereq) => {
            return (
              <li key={prereq.slug}>
                <Link to={`/topics/${prereq.slug}`}>{prereq.title}</Link>
              </li>
            );
          })}
        </ul>
      )}

      <h2>Tags</h2>
      <TagCloud tags={tags} />

      <h2>Owner</h2>
      <p>Jen Gilbert (jgilbert@cloudco.com)</p>
    </>
  );
};
