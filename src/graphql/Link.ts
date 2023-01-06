import { extendType, nonNull, objectType, stringArg, intArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id")
        t.nonNull.string("description")
        t.nonNull.string("url")
    },
});

let links: NexusGenObjects["Link"][] = [
    {
        id: 1,
        url: "google.com",
        description: "Popular search engine",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({
    type: "Query",

    // extend LinkQuery type with root fields
    definition(t) {

        // add root field "feed" -> [Link!]!
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context, info) {
                return links;
            },
        });

        // add root field "link" -> Link
        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },

            // returns null if no matching link ID is provided
            resolve(parent, args, context, info) {
                const { id } = args;
                const requestedLink = links.find(link => link.id === id);

                if (requestedLink) {
                    const link = {
                        id: requestedLink.id,
                        description: requestedLink.description,
                        url: requestedLink.url,
                    };

                    return link;
                } else {
                    throw new Error("A link with the requested ID cannot be found!");
                }
            },
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;

                let idCount = links.length + 1;
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };

                links.push(link);
                return link;
            },
        });

        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                url: stringArg(),
            },

            resolve(parent, args, context) {
                const { id, description, url } = args;
                const requestedLink = links.find(link => link.id === id);

                if (requestedLink) {
                    const link = {
                        id,
                        description: description ? description : requestedLink.description,
                        url: url ? url : requestedLink.url,
                    };

                    links.map(link => link.id === id ? { id, description, url } : link);
                    return link;
                } else {
                    throw new Error("A link with the requested ID cannot be found!");
                }
            },
        });
    },
});
