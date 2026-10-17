# The continuum: from the platform landscape to deployable units

The definitions this bundle is built on, in one place, each anchored in current practice and each stated with the intention behind it. The skills, the standards, the schemas and the metamodel conform to this page. Where one of them says something different, this page is the authority and the other is the thing to fix. [Architectural Framework](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/architectural-framework.md) gives the longer reasoning behind the hierarchy; this page fixes the words.

The page also records how three working repositories use the words today, where they disagree, and what the bundle does about each disagreement.

## Why this page exists

An architecture method is only as coherent as its vocabulary. The words below come from four traditions that overlap without agreeing: enterprise architecture (TOGAF 10, the Open Group's O-AA standard and ArchiMate 3.2), strategic domain-driven design (Evans, Vernon, Khononov, Tune), platform engineering (Team Topologies, the CNCF platforms work, Hohpe) and software architecture description (ISO/IEC/IEEE 42010:2022, the C4 model, arc42, Richards and Ford). Beside them sit the frameworks most working architects are measured against today: the AWS, Azure and Google Cloud Well-Architected frameworks, each of which defines the workload it governs and the qualities it judges, and the Backstage system model, which is how a software catalogue names the same things in a portal. Each of these is placed on the continuum in [Contemporary practice, by source](#contemporary-practice-by-source). Each tradition owns part of the continuum from an enterprise down to a process running in a cloud account, and none owns all of it. The bundle has to say, for each word, which tradition's meaning it takes and where the handover between traditions happens.

The intention is a single continuum that an architect, an engineer and an agent can all walk without changing vocabulary: start at the enterprise landscape, end at a container on a node, and at every step know what the thing is, what it answers, who owns it and what it links to above and below.

## The continuum in one picture

![The continuum from the platform landscape through platform, capability, bounded context, architecture building block, solution building block and service to deployment node, with outcomes, use cases, domains and products on the left, and architecture patterns, reference architectures, considerations and contracts on the right](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/continuum.svg)

The picture is `continuum.svg`; `continuum.drawio` beside it is the same diagram as an editable, uncompressed draw.io source, to redraw from when a level or a relationship changes, and the SVG is exported from it.

[Views of the continuum](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/continuum-views.md) shows the same continuum in the words of C4, TOGAF, domain-driven design, ArchiMate, platform engineering, Team Topologies and the Well-Architected frameworks, one diagram each.

Three bands run across the picture. The demand space (landscape, platform, capability) says who owns what and what must be possible; it is demand rather than problem because what asks for architecture is as often an opportunity as a problem. The solution space (bounded context, architecture building block, solution building block) says how it is structured and built. The runtime (service, deployment node) says what runs where. Architecture patterns and reference architectures sit beside the solution space because they compose building blocks at any scope; products sit beside the whole thing because they are what a consumer is offered and what a team runs.

## The levels

Each level below gives the definition the bundle adopts, the practice it is taken from, the question it answers, and how it appears in the bundle. The relationships are summarised in [one table](#the-relationships) after the levels.

### Platform landscape

The landscape is the whole set of platforms an enterprise runs, arranged in layers so that a platform consumes only the platforms in the layers below it, and only through their contracts. It answers: what platforms exist, and which depends on which.

In practice this is TOGAF's Enterprise Continuum applied to an organisation's own estate, and the platform-of-platforms shape that platform engineering describes: higher platforms are customers of lower ones, consumption is self-service and contract-mediated, and a platform with no consumers is retired rather than maintained. The layering the author uses puts foundation and infrastructure at the bottom, shared services above it, data and domain platforms above those, and products and experiences at the top. The same shape, with a layer holding platforms and a platform holding building blocks, connections and waves, is what the author's enterprise landscape model records for enterprise-scale work.

The word is chosen to avoid a clash. TOGAF's Architecture Landscape means the architectures held in the repository at strategic, segment and capability level, and the industry's application landscape means the inventory of applications; this level is the map of platforms, so it is called the platform landscape.

In the bundle a landscape is `LS-NNN`, kind `landscape`, with its `layers` (`L0` at the bottom, each listing the platforms it holds) and its `dependencies` (which platform consumes which, and through which contracts); each platform names its `landscape` and `layer`. A layer is declared on the landscape and is not a kind of its own. The metamodel's Organisation and Platform grouping and the ontology's platform entity have yet to follow. In patternode-platform the landscape is `docs/architecture/platform-of-platforms.md`, with five layers L0 to L4; in LifeGuide it is `docs/2-architecture/platform-architecture.md`, with platforms PL-01 to PL-08 in layers L0 to L4.

### Platform

A platform is a team-owned, boundary-defined, self-service unit of capability: the organisational unit that owns outcomes, provides capabilities, contains one or more bounded contexts and offers products to consumers outside it. It answers: who owns and provides it.

The definition is platform engineering's. Evan Bottcher's digital platform is "a foundation of self-service APIs, tools, services, knowledge and support which are arranged as a compelling internal product"; Team Topologies (second edition, 2025) gives the platform team, the Thinnest Viable Platform and the interaction modes; the CNCF Platforms White Paper (2023) gives the attributes a platform should show and the CNCF Platform Engineering Maturity Model (2023 onward) measures a platform on investment, adoption, interfaces, operations and measurement; Gregor Hohpe's Platform Strategy (2024) argues that a platform drives innovation through harmonisation and warns that in-house platforms fail when they restrict rather than enable. The bundle keeps the executive owner and the owning team as required fields because ownership is the point of the level.

In the bundle a platform is `PL-NNN`, authored by `/architecture platform` to the [platform standard](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/platforms/platform-standard.md), with `owns_outcomes`, `provides_capabilities` and `contains_bounded_contexts`. The front matter is in the [frontmatter standard §6.3](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/standard-frontmatter.md).

### Domain and subdomain

A domain is the sphere of knowledge and activity a system is about: the demand space, before any decision about how it is met. A subdomain is a part of a domain, classified as core (where the business differentiates), supporting (needed, not differentiating) or generic (bought or borrowed). A domain answers: what is this about.

This is Eric Evans's definition in Domain-Driven Design, with Vaughn Vernon's subdomain classification from Implementing Domain-Driven Design. Vernon also gives the rule that joins the two spaces: a subdomain in the demand space (Vernon's demand space) maps to a bounded context in the solution space, ideally one to one, and a context that spans subdomains, or a subdomain split across contexts, is a sign that a boundary is in the wrong place. Nick Tune's Architecture Modernization (2024) is the current treatment: domains and subdomains found by listening tours and EventStorming, a product taxonomy over them, and independent value streams aligned to domains, outcomes and teams. Vlad Khononov's Learning Domain-Driven Design (2021) gives the subdomain kinds their modern reading, and AWS Prescriptive Guidance's decompose-by-subdomain pattern makes the same move for a monolith being taken apart. The bundle's framework document argued that platform replaces domain as the grouping unit, and that holds for ownership. It does not hold for meaning: a platform is an ownership and consumption boundary, a domain is a boundary of subject matter, and the two usually coincide without being the same thing. Patternode's target state groups its contexts into trading, data, knowledge and platform; LifeGuide divides its contexts into core and supporting. Both are domain language, and both are useful beside the platform language.

In the bundle a domain is not a folder or an identifier. It is recorded in two places: the subdomain classification of each bounded context, `subdomain_kind: core | supporting | generic`, and the domain a platform serves, named in the platform's purpose. A domain is realised by one or more platforms and is never owned by more than one.

### Capability

A capability is what the organisation must be able to do, expressed in business terms and independent of how it is done. It encompasses organisation, people, processes and technology, and it survives a change of implementation. It answers: what must be possible.

The source is TOGAF's Business Architecture work on business capabilities, with BIZBOK's capability mapping behind it. The bundle adds two measures a capability carries: maturity, 0 to 5, which measures a capability once it operates, and the stage on the definition ladder, R0 Unrecognised to R6 In service, which measures how far it has been defined and is derived from the artefacts beneath it rather than asserted. The two are separate axes.

In the bundle a capability is `CAP-NNN`, authored by `/architecture capability` to the [capability standard](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/capabilities/standard-capability-document.md), with levels L1 to L3, `realised_by_abbs`, optional `flows[]` and the stage read by `/architecture stage`. Patternode's `capabilities/` has one area, AI Operations, with thirteen L2 capabilities at R1, and its L3 sub-capabilities listed inline without identifiers.

### Product

A product is a consumable offering of one platform: what a consumer asks for, stated in the consumer's terms, and what a named team runs. It has one owner, a state (backlog or available), a runbook, a measure and a known operating cost. It requires capabilities, and it runs services. It answers: what is someone offered, and who answers for it running.

The definition is the author's own, written in Patternode's [product and capability model](https://github.com/patternode/patternode-architecture/blob/main/governance/product-capability-model.md), and it resolves a word that had three meanings. A product is the consumable offering. A vendor's offering that realises a building block is a technology. A named output of an epic is a deliverable. Platform engineering's "platform as a product" is re-expressed as: a platform offers products.

In the bundle a product is `PRD-NNN`, kind `product`, with the relationships Patternode already records: `platform` names the platform that offers it, `requires` and `requires_flows` the capabilities it needs, `runs` the services it runs, and `team` who answers for it. Its features are rows of a register beside it, `FE-NNN`, each fulfilling use cases and implemented by services. Patternode registers products as `PRD-NNN` in `products/products.csv`.

### Bounded context

A bounded context is the boundary within which one domain model and one ubiquitous language hold. It belongs to exactly one platform, is owned by one team, realises one or more capabilities, and contains the architecture building blocks that structure its model. It is a boundary of meaning and ownership, not a deployment. It answers: where does this model and this language apply.

The source is Evans, with Martin Fowler's summary that DDD "deals with large models by dividing them into different Bounded Contexts and being explicit about their interrelationships". The relationships between contexts are the context map patterns: published language, conformist, customer and supplier, open host service, shared kernel and anti-corruption layer. The cloud vendors now teach the same boundary: the Azure Architecture Center splits strategic DDD (map the domain, set the bounded contexts) from tactical DDD (model inside one context) and sizes a microservice "no smaller than an aggregate and no larger than a bounded context"; AWS's Well-Architected reliability pillar asks for services focused on specific business domains and recommends a bubble context behind an anti-corruption layer for legacy code; the Open Group's O-AA standard (2020) brings bounded contexts and EventStorming into enterprise architecture practice. Team Topologies' Independent Service Heuristics are the lightweight test for a candidate boundary: could this part run as its own product. Inside a context the bundle expects a hexagonal layout: a domain that imports no framework, ports it declares, adapters that implement them, and one composition root per deployable.

In the bundle a bounded context is `BC-NNN`, authored by `/architecture context` to the [bounded context standard](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/contexts/standard-bounded-context.md), with `part_of` the platform, `realises_capabilities`, `contains` ABBs, `ubiquitous_language`, `relationships` and `subdomain_kind`. Both patternode-platform and LifeGuide lay out their code as `bounded-contexts/<name>/`; Patternode's target state names ten contexts with their kind, record, published contract and where each runs.

### Architecture building block

An architecture building block is a package of functionality defined at the logical level, technology-agnostic, with published and reasonably stable interfaces, that realises part of a capability. It says what must exist. It answers: how is it structured, independent of product.

The source is TOGAF's building blocks: a building block is a package of functionality defined to meet business needs, with a defined boundary recognisable as a thing by domain experts, interfaces that are published and stable, and the properties of being reusable, replaceable and well specified. TOGAF describes the early, functional-level block as an architecture building block and the later, product-level block as a solution building block. TOGAF 10 (2022) keeps the definition, and its Business Capabilities guide (version 2, 2022) is where capabilities and the blocks that realise them are joined. The bundle makes one deliberate addition from DDD: an architecture building block lives inside one bounded context, so that its logical model is governed by that context's language. Reuse across contexts happens through a pattern that names it, or through a cross-cutting platform whose block is consumed through an adapter, never by sharing the block's model.

In the bundle an architecture building block is `ABB-NNN`, authored by `/architecture abb` to the [ABB document](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/building-blocks/architecture-building-blocks/standard-abb-document.md) and [diagram](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/building-blocks/architecture-building-blocks/standard-abb-diagram.md) standards, with `part_of` the context, `realises_capabilities`, `realised_by` SBBs, `requires` other ABBs, `interfaces` and `composed_by`, the architecture patterns that name it. Patternode's `building-blocks/abbs/` is a placeholder, so every box in its patterns is a local role today. LifeGuide uses ABB-001 to ABB-006 only for persistence technology.

### Solution building block

A solution building block is a concrete realisation of one or more architecture building blocks using named technologies: products bought, services subscribed to or components built. It records which technology realises which component of the block, the cloud and the deployment model, and, when composite, its parts, ports and connectors. It says what we chose to build or buy. It answers: which technologies realise it.

The source is again TOGAF: the solution building block sits in the Solutions Continuum, specifies the products and components that implement the functionality, and maps to the architecture building blocks it satisfies. The bundle's composite form draws on UML composite structure, and its outside view on the C4 system context diagram.

In the bundle a solution building block is `SBB-NNN`, authored by `/architecture sbb`, with `realises` ABBs, `technologies` (formerly `products`), `product_mapping`, `cloud_provider`, `deployment_model`, `realised_by_services` and `composed_by`, the reference architectures that name it. Patternode's `building-blocks/sbbs/` is a placeholder. Patternode's word for a vendor's offering is technology, and the bundle adopts it.

### Architecture pattern and reference architecture

The continuum has two kinds of pattern document, and never a pattern on its own. An architecture pattern is technology-agnostic: a reusable arrangement of building blocks, the interfaces between them and the scenarios that walk across them, at any scope from one recurring problem to a whole platform, with every box a local role (conceptual) or an architecture building block (logical). A reference architecture is technology-specific: the same arrangement with products chosen, every box a solution building block or a named technology (physical), and it names the architecture patterns it applies, one or more, as a solution building block realises an architecture building block. A solution design instantiates a reference architecture for one consumer. Between them they answer: how is this kind of problem solved, in a form others can build from, and how is it built here.

The word comes from Alexander through the design patterns literature: a solution to a recurring problem in a context, with the forces it balances. Len Bass and colleagues add the distinction that matters here: an architectural pattern is a set of constraints on element types and their interactions, not itself an architecture. Both kinds are authored by the `pattern` skill in [architecture-pattern](https://github.com/dermot-obrien/architecture-pattern), whose construct has two independent axes:

| Axis | Values | Set how |
|---|---|---|
| Scope | `problem`; `domain`, `capability-area`, `platform`, `hosting-profile`, `epic` | Declared in front matter as `pattern_scope` |
| Abstraction | `conceptual`, `logical`, `physical`, `mixed` | Derived by `model validate` from the kinds of box, never declared |

On the continuum the type decides the abstraction a document may have: an architecture pattern is conceptual or logical, a reference architecture is physical, and a mixed document is one still being written. Every document declares its type as `pattern_type` (`architecture-pattern` or `reference-architecture`), takes its identifier from that type's series (`AP-NNN` for an architecture pattern, `RA-NNN` for a reference architecture), so that the kind is read from the identifier alone, and a reference architecture records the architecture patterns it applies in `implements`, a list. A repository binds the two types in `[suite.pattern.types.*]` of its binding file, each with its label, series and how physical it must be, and `model validate` warns when a document's boxes do not fit its type. Each names the capabilities it realises, and the definition ladder reads them: an architecture pattern at logical abstraction, every box an architecture building block, is what R3 Decided needs; a reference architecture with a cost model, every box a solution building block or technology, is what R4 Buildable needs.

The practice literature does not agree on the words, and the bundle does not pretend otherwise. Philippe Kruchten defines a reference architecture as a predefined architectural pattern, or set of patterns, possibly partially or completely instantiated, designed and proven for use in particular business and technical contexts. Bass defines it as a reference model mapped onto software elements. Angelov, Grefen and Greefhorst list what one contains: domain rules, standards, software and hardware elements, styles and patterns, and best practice. What the definitions share is that a reference architecture is an architecture pattern instantiated towards technology, which is exactly the abstraction axis above. The clearest contemporary evidence is the cloud vendors' own catalogues: the AWS Architecture Center and the Azure Architecture Center publish reference architectures that are physical by construction, every box a named service, each applying architecture patterns the same centres publish separately, and the Well-Architected lenses and perspectives (serverless, SaaS, machine learning, generative AI) are the same idea at the hosting-profile scope. TOGAF's Architecture Continuum adds a second axis, generality: foundation, common systems, industry and organisation-specific architectures. The bundle keeps generality separate from abstraction: generality is a property of the catalogue a document is published in, abstraction is derived from its boxes.

The `pattern` skill itself leaves its documents untyped unless a repository binds types. The continuum does not: a document with no type is not yet on it, because its readers cannot tell whether it is a design to reason from or a build to follow.

### Service, the deployable unit

A service is the unit of execution: a runtime boundary around code that runs as its own process, separately built, versioned, released and deployed, that realises one or more solution building blocks and lives inside one bounded context. It is run by a product and deployed to one or more deployment nodes. It answers: how does it run.

The definition is the C4 model's container, which Simon Brown describes as "a runtime boundary around some code that is being executed or some data that is being stored", with the examples he lists: a server-side web application, a serverless function, a console application, a mobile app, a database. He is explicit that JAR files, assemblies and modules organise code inside a container and are not containers, and that deployment is a separate concern from the container itself. Sam Newman's test for a microservice, that it is independently deployable, is the same test, and Richards and Ford's architecture quantum in Fundamentals of Software Architecture (second edition, 2025), an independently deployable artefact with high functional cohesion, is its formal statement. ArchiMate calls the logical thing an application component and the deployed thing an artifact on a node. Backstage, the catalogue most platform teams run, calls it a component of type service, with its APIs and the resources it depends on, and patternode-platform already describes one service that way in a `catalog-info.yaml`.

The word service is overloaded, and the bundle says so rather than pretending otherwise. In ArchiMate and in TOGAF a service is behaviour exposed to a consumer, not a deployable, and C4 chose container precisely to avoid the words service, process and application. The bundle keeps service because its skills, schemas and the microservices literature use it for the deployable, and uses deployable as the plain-language word where the ArchiMate sense could be read.

The bundle narrows C4's container in one way. A service executes code. A data store (a named database, a bucket, a table) is a resource owned by one bounded context and recorded on the service that owns it and on the node that hosts it, not as a service of its own. Backstage draws the same line: a component is software, a resource is the infrastructure it needs to run, and a database is a resource. Whether to keep that narrowing is one of the [decisions](#decisions-for-the-owner) below.

In the bundle a service is the `service` kind, authored by `/architecture service` to the [service standard](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/runtime/standard-service.md), with a kebab-case id, an optional `numeric_id: SV-NNN`, `realises` SBBs, `part_of` one context, `runtime_type`, `repo` and `module_path`, and `deployed_to` nodes. Patternode calls these deployables and lists fourteen on GCP and six on AWS as built, and eleven in its target state. LifeGuide's are Cloud Run services, Cloud Functions and one MCP server per context. In both, the as-built mapping breaks the one-context rule in places: Patternode's strategy engine composes three target contexts in one process, and its Segmentation context runs only as a library inside its callers. The catalogue records those as findings against the target, not as exceptions to the definition.

### Module and component

A module is a unit of code inside a service: a Gradle module, a Python package, an assembly. It is built and versioned, but it is not separately deployed. In the bundle's hexagonal layout a bounded context's modules are its contract (the published types other contexts may use), its domain (entities, rules and ports, with no framework), its adapters (the infrastructure that implements the ports) and its service module (use cases, wiring and the composition root). It answers: how is the code inside a deployable organised.

The source is Alistair Cockburn's ports and adapters, with the C4 component as the level of description. A module is not an architecture building block: the block is the logical structure, the module is one implementation's code layout for it. The bundle records modules only on the service, as `module_path` and `packages`, and does not catalogue them.

### Deployment node

A deployment node is where a service runs: a cloud account and region, a runtime such as Cloud Run or Lambda, a virtual machine, a hosting service, a device. It carries the properties that matter to operating the service: the account, the region, the scaling model, the identity the service runs as. It answers: where does it run, and under whose account.

The source is ArchiMate's node and C4's deployment diagram, and TOGAF's technology architecture behind both. In the bundle a deployment node is `DN-NNN`, kind `deployment-node`, with `node_type`, `runtime`, `cloud_provider`, `account`, `region`, `scaling_model`, `run_as`, the services it `hosts` and the stores it hosts in `hosts_stores`. It is defined because the deployable register Patternode needs cannot be written without it: the same service has run on a GCE VM and is proposed as four containers on one node, and that difference is a node property, not a service property.

### Beside the continuum

Four kinds sit beside the thread rather than on it. An outcome (`OC-NNN`) is a measurable business result a platform owns and a capability serves. A use case (`UC-NNN`) is a set of behaviours that gives an actor an observable result of value, in the UML sense, with owned scenarios. It is not isolated. It supports an outcome, it requires the capabilities that make it possible (which is how demand justifies a capability), it is fulfilled by the features of a product, and it is realised by an architecture pattern, whose scenarios walk the use case's scenarios across the building blocks the use case named as participants, and made concrete by the reference architecture that applies it. A feature (`FE-NNN`) is something a product does that its users value, stated in the product's own terms and small enough that one story can deliver it; it is the product's unit of behaviour, the thing a use case needs and the thing a change (an improvement) adds or alters, and it is implemented by services in bounded contexts. [From a use case to a solution](#from-a-use-case-to-a-solution) says why the feature is the hinge. The `use-case` skill in architecture-pattern writes it before any design, with participants and interactions in the same model form a pattern uses, so the two can be checked against each other. A consideration (`CN-NNN`) is an open question with more than one credible answer, affecting any artefact on the thread, and a decision record (`DR-NNN`, or `ADR-NNN` where a repository keeps that series) settles it. A technical debt item (`TD-NNN`) is a consequence of a decision: a shortfall the decision knowingly took on, or accepted once found, with the interest it costs to carry and the principal it would cost to put right. The decision lists it among its consequences, the item names the decision, and a later decision that repays it is recorded on both, so a debt is never separated from the reasoning that made it acceptable. Interfaces, APIs and events are the contracts between contexts, declared on the building blocks and published as versioned artefacts from the owning context's contract module.

## The relationships

The golden thread the bundle has always drawn, Outcome to Service, extended with the kinds this page adds. Read each row as subject, relationship, object. [The schema on the continuum](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/schema.md) draws the same relationships from the front matter schemas, in this page's layout, with each field named.

| From | Relationship | To | Where it is recorded |
|---|---|---|---|
| Landscape | has | Layer | Landscape `layers` |
| Layer | holds | Platform | Landscape `layers[].platforms`; platform `landscape` and `layer` |
| Platform | consumes, down and through contracts only | Platform | Landscape `dependencies` |
| Platform | owns | Outcome | Platform `owns_outcomes` |
| Platform | provides | Capability | Platform `provides_capabilities` |
| Platform | contains | Bounded context | Platform `contains_bounded_contexts`, context `part_of` |
| Platform | offers | Product | Product `platform` |
| Domain | is realised by | Platform | Platform purpose; context `subdomain_kind` |
| Subdomain | maps to, ideally one to one | Bounded context | Context `subdomain_kind` |
| Outcome | requires | Capability | Outcome `requires_capabilities`, capability `required_by_outcomes` |
| Use case | supports | Outcome | Use case `supports_outcome`, outcome `supported_by_use_cases` |
| Use case | requires | Capability | Use case `requires_capabilities`; the capability's demand |
| Use case | is fulfilled by | Feature, of one or more products | Feature `fulfils`, use case `fulfilled_by_features` |
| Use case | is realised by | Architecture pattern, through its scenarios | Use case `realised_by`, pattern `serves`; the pattern's scenarios walk the use case's |
| Product | has | Feature | Feature `part_of`, product `features` |
| Feature | is implemented by | Service, in one or more bounded contexts | Feature `implemented_by` |
| Team | owns | Product, Platform, Bounded context | Platform `owner`, context `owner`, product `team` |
| Product | requires | Capability, optionally some flows | Product `requires`, `requires_flows` |
| Product | runs | Service | Product `runs`; service `run_by` |
| Capability | is realised by | Bounded context | Context `realises_capabilities` |
| Capability | is realised by | Architecture building block | ABB `realises_capabilities`, capability `realised_by_abbs` |
| Capability | is realised by | Architecture pattern, reference architecture | `realises` on either, read by `/architecture stage` |
| Bounded context | contains | Architecture building block | Context `contains`, ABB `part_of` |
| Bounded context | relates to | Bounded context | Context `relationships`, with the context map pattern |
| Architecture building block | requires | Architecture building block | ABB `requires` |
| Architecture building block | is realised by | Solution building block | SBB `realises`, ABB `realised_by` |
| Architecture pattern | composes | Architecture building block, local role | Its Building Blocks table; pattern `composes` and ABB `composed_by` for catalogued blocks |
| Reference architecture | composes | Solution building block, technology | Its Building Blocks table; pattern `composes` and SBB `composed_by` for catalogued blocks |
| Reference architecture | applies, one or more | Architecture pattern | Reference architecture `implements`, a list; architecture pattern `implemented_by` |
| Solution building block | is realised by | Service | Service `realises`, SBB `realised_by_services` |
| Service | is part of | Bounded context | Service `part_of` |
| Service | owns | Store | Service `stores`, store `owned_by` |
| Service | is deployed to | Deployment node | Service `deployed_to`, node `hosts` |
| Store | is part of, and hosted on | Bounded context, deployment node | Store `part_of` and `hosted_on`, node `hosts_stores` |
| Consideration | affects | Capability, ABB, SBB, architecture pattern, reference architecture | Consideration `affects` |
| Consideration | is resolved by | Decision record | Consideration `resolved_by` |
| Decision record | has as a consequence | Technical debt | Decision record `consequences.technical_debt`, debt `consequence_of` |
| Decision record | repays | Technical debt | Decision record `repays_debt`, debt `repaid_by` |
| Technical debt | affects | Any artefact that carries it | Debt `affects` |

## From a use case to a solution

A business team writes a use case: what someone needs to be able to do, in their words, before anyone designs how. The question is what joins that use case to the solution that ends up running. The bundle answers: through the product, and the joint is the feature.

The chain is this. A stream-aligned team owns a product. A product has features, each something the product does that its users value, in the product's own terms. A use case is fulfilled by one or more features, usually of one product and sometimes of several when the use case is a journey across them. A feature is implemented by services inside bounded contexts, under the reference architectures that realise the capabilities the use case requires. So from a use case there are two paths down, and both are needed: the design path, use case to capability to architecture pattern to building blocks, which says what must exist; and the delivery path, use case to feature to service, which says what runs and who runs it. The product is where the two meet, because the product is what the team owns and what the consumer gets.

| Step | Who | Writes | Links to |
|---|---|---|---|
| A need | The business team, stream-aligned to the product | A use case: actor, result, scenarios, participants | The outcome it supports; the capabilities it requires |
| An offer | The product owner | A feature of the product, or an improvement that adds or changes one | The use cases it fulfils |
| A design | The architect, with the team | An architecture pattern realising the capability, naming the building blocks; the reference architecture that applies it, naming the products | The use case's scenarios, walked across the blocks |
| A build | The team that owns the bounded context | Services and their stores, under the reference architecture | The feature they implement; the SBB they realise |
| In service | The product's team | The runbook and the measure | The product, now available |

Three alternatives were considered and set aside.

| Alternative | Why not |
|---|---|
| Link the use case straight to a bounded context or a service | A use case spans contexts more often than not (a journey touches several), and it is written before the contexts are designed. The link would be wrong at first and brittle after |
| Link it only through capabilities | Right for design, silent on delivery: a capability says what must be possible, not which product offers it or who runs it. The team and the runbook would have no place |
| Introduce a solution entity between use case and services | TOGAF's solution is the set of solution building blocks that realise a design, which the continuum already has as the SBBs and the services; a product's implementation is that set. A second word for it adds a level with nothing of its own to say |

The feature is the right joint because three traditions already put something there. Team Topologies defines the stream a team is aligned to as the flow of change through a product, service, journey or persona, and features are what flows. Patternode's product model defines a feature as what a product does and an improvement as a change to one, with the pull requests that cite the improvement as its delivery record. Tune's product taxonomy places products over subdomains and features over products. None of them names a solution; all of them name the product and what it does. The consequence for the bundle is a `feature` kind beside `product`, with `fulfils` to use cases and `implemented_by` to services, which the service register in a repository like Patternode's can then answer in both directions: which features a service implements, and which services a feature needs.

## What is industry practice and what is this bundle's choice

The diagram is meant to be read as current practice, so each element is marked here by where it comes from. Standard means a published specification defines it. Practice means the mainstream literature agrees on it without a specification. Choice means this bundle decided it, and a reader from another practice should expect to find it done differently elsewhere.

| Element | Status | Source |
|---|---|---|
| Platform landscape in layers, dependencies down and through contracts | Practice | TOGAF Enterprise Continuum; Team Topologies platform teams; the CNCF Platforms White Paper (2023); Hohpe, Platform Strategy (2024); Backstage's Domain and System groupings |
| Platform as the owning, self-service unit of capability | Practice | Bottcher; Team Topologies (2nd edition, 2025); the CNCF white paper and maturity model; Hohpe (2024) |
| Platform offers products | Practice | Team Topologies "platform as a product"; O-AA's product-centric organisation; Tune's product taxonomy (2024); the Well-Architected frameworks' workload, which is what a product runs |
| Outcome, driver, goal | Standard | ArchiMate 3.2 motivation elements; TOGAF Architecture Vision |
| Use case with owned scenarios | Standard | UML |
| Capability, four dimensions, levels L1 to L3, maturity 0 to 5 | Standard | TOGAF Series Guide: Business Capabilities, version 2 (2022); BIZBOK |
| The stage on the definition ladder | Choice | This bundle. Industry has capability maturity, not a definition ladder |
| Domain, subdomain, core, supporting, generic | Standard | Evans; Vernon; Khononov, Learning Domain-Driven Design (2021); Tune, Architecture Modernization (2024) |
| Subdomain maps to bounded context, ideally one to one | Practice | Vernon; the Azure Architecture Center's strategic and tactical DDD; AWS Prescriptive Guidance, decompose by subdomain; Team Topologies' Independent Service Heuristics |
| Bounded context, ubiquitous language, context map relationships | Standard | Evans; the context map patterns are Evans's; O-AA (2020) adopts them into Open Group practice; AWS Well-Architected REL03-BP02 and the bubble context |
| Hexagonal layout inside a context | Practice | Cockburn; AWS Prescriptive Guidance, Building hexagonal architectures on AWS; the Azure Architecture Center's tactical DDD |
| ABB and SBB, the building block properties, ABB before SBB | Standard | TOGAF 10 (2022) building blocks and the Solutions Continuum |
| An ABB lives inside one bounded context | Choice | This bundle, at the DDD and TOGAF intersection. TOGAF leaves a building block enterprise-wide |
| Architecture pattern and reference architecture as building blocks, interfaces and scenarios | Practice | arc42 building block and runtime views; C4 component and dynamic diagrams; Kruchten's 4+1; ISO/IEC/IEEE 42010:2022 on views, decisions and rationale |
| Scope and abstraction as two axes | Choice | This bundle, mapping TOGAF's generality axis and the conceptual, logical, physical levels |
| Architecture pattern and reference architecture as abstract and instantiated | Practice | Bass; Kruchten; Angelov, Grefen and Greefhorst; the AWS and Azure Architecture Centers' reference architectures and the Well-Architected lenses, which are physical by construction. The literature agrees on the direction and not on the words |
| Consideration as an artefact | Choice | This bundle. Industry records the decision (Nygard's ADR, MADR, the AWS Prescriptive Guidance ADR process) and leaves the open question informal |
| Technical debt as a consequence of a decision | Choice, with support | Cunningham's debt metaphor and Fowler's technical debt quadrant; Nygard's ADR records consequences. Industry keeps debt in a backlog; this bundle attaches each item to the decision whose consequence it is |
| Product requires capability; product runs service | Choice | This bundle, from Patternode's product and capability model. Service ownership by a product team is practice; the recorded relationship is not |
| Service as the deployable unit | Standard, under another name | C4's container; ArchiMate's artifact assigned to a node; Newman's independently deployable service; Richards and Ford's architecture quantum (2025); Backstage's component of type service |
| Use case requires capability | Practice | TOGAF capability-based planning and BIZBOK: demand justifies a capability |
| Use case realised by an architecture pattern | Standard | UML 2.5.1: a use case may be realised by a collaboration (18.1.3), and a pattern is a parameterised collaboration applied through a collaboration use (11.7); the Unified Process calls that collaboration a use-case realization. The bundle collapses the realization and the pattern it applies into one document: the pattern's participants and interactions are the collaboration, its scenarios are the realization's interaction diagrams |
| The feature as the hinge between a use case and the services that fulfil it | Choice, with support | Patternode's product model (a feature is what a product does, an improvement changes one); Team Topologies' stream of change; Tune's product taxonomy |
| Store as a resource of a service, not a service | Choice, with support | This bundle, decision D1. C4 counts a database as a container; Backstage counts it as a resource, which is the side this bundle takes |
| Module and component inside a deployable | Standard | C4 component; ArchiMate application component; the Azure Architecture Center's aggregate as the lower bound of a service |
| Deployment node | Standard | ArchiMate 3.2 node and device; C4 deployment node; the Well-Architected frameworks' account, region and runtime guidance |
| Contracts between contexts | Practice | Evans's published language and open host service; consumer-driven contracts; Backstage's API kind |
| Quality attributes judged at product, architecture pattern and reference architecture | Standard | The AWS, Azure and Google Cloud Well-Architected pillars; ISO/IEC 25010 |

## Contemporary practice, by source

The frameworks a working architect is measured against today, and where each lands on the continuum. None of them covers the whole continuum, which is the reason this page exists, and each covers its part well.

| Source | Current edition | What it defines | Where it lands |
|---|---|---|---|
| AWS Well-Architected Framework | Six pillars, refreshed through 2024 and 2025: operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability; sixteen lenses | A workload as the unit it judges, with best practices per pillar. REL03-BP02 asks for services built around specific business domains and recommends a bubble context behind an anti-corruption layer | The pillars are the quality attributes of a product's workload and of a pattern; the lenses are hosting-profile patterns; REL03-BP02 is the bounded context |
| AWS Prescriptive Guidance | Living | Decompose by subdomain; building hexagonal architectures on AWS; the ADR process | Domain and subdomain, bounded context, module layout, decision record |
| Azure Well-Architected Framework | Five pillars, rewritten 2023 onward: reliability, security, cost optimisation, operational excellence, performance efficiency | A workload as "application resources, custom code, AI models, data and supporting infrastructure that together serve business goals", judged per workload, with the Cloud Adoption Framework above it for the portfolio | The workload is what a product runs; the Cloud Adoption Framework is the landscape |
| Azure Architecture Center | Living | Strategic DDD to set bounded contexts, tactical DDD inside one; a microservice no smaller than an aggregate and no larger than a bounded context; reference architectures | Domain, bounded context, module, service; reference architecture as the physical pattern type |
| Google Cloud Well-Architected Framework | Renamed from the Architecture Framework; pillars with sustainability added; perspectives for AI and ML and for industries | Core principles, the first "design for change", with DORA's delivery metrics as the measure | Quality attributes; the product's measures |
| TOGAF Standard, 10th edition (2022) | Modular: the fundamental content plus Series Guides, including Business Capabilities version 2 (2022) | Building blocks, the Enterprise Continuum, capabilities and the capability map | Capability, ABB, SBB, the generality axis of patterns |
| Open Agile Architecture, O-AA (2020) | The Open Group's standard for agile and digital transformation | Product-centric architecture that adopts domain-driven design, bounded contexts and EventStorming into Open Group practice | Product, domain, bounded context: the Open Group's own endorsement of the DDD and TOGAF intersection this bundle sits on |
| ArchiMate 3.2 (2022) | Current | Motivation elements; application component and service; artifact, node and device | Outcome; the logical and deployed halves of a service; deployment node |
| ISO/IEC/IEEE 42010:2022 | Second edition | Architecture descriptions of an entity of interest, with views, decisions and rationale | Why every architecture pattern and reference architecture carries decisions and risks |
| The C4 model | Living site | Container, component, deployment node; dynamic diagrams | Service, module, node; scenarios |
| Backstage system model | Living | Domain, System, Component (service, website, library), Resource, API, with ownership relations in `catalog-info.yaml` | The runtime level as a catalogue: service, store as resource, contracts as API, domain as grouping |
| CNCF Platforms White Paper (2023) and Platform Engineering Maturity Model | Living | A platform as an integrated collection of capabilities presented for its users; maturity on five aspects at four levels | Platform; the measure of a platform |
| Team Topologies, 2nd edition (2025), and Independent Service Heuristics | Current | Platform, stream-aligned, enabling and complicated-subsystem teams; interaction modes; heuristics for a boundary that could stand as its own product | Platform ownership; the test for a bounded context or a service boundary |
| Hohpe, Platform Strategy (2024) | Current | Platforms as innovation through harmonisation; why in-house platforms fail | Platform |
| Tune and Perrin, Architecture Modernization (2024) | Current | Domains and subdomains from listening tours and EventStorming; a product taxonomy; independent value streams | Domain, product, bounded context |
| Khononov, Learning Domain-Driven Design (2021) and Balancing Coupling in Software Design (2024) | Current | Subdomain kinds; bounded contexts; coupling as strength, distance and volatility | Domain, bounded context, the rules for contracts between contexts |
| Richards and Ford, Fundamentals of Software Architecture, 2nd edition (2025) | Current | Architecture characteristics; the architecture quantum; components; governance | Quality attributes; the service as quantum; module |
| Nygard's ADR and MADR | Living | The decision record | Decision record |

Two things in this table shaped the bundle's choices rather than merely confirming them. Backstage's split of component and resource is why a store is a resource of a service here. And O-AA's adoption of bounded contexts into Open Group practice is why putting a building block inside a context is treated as a choice within current practice, not against it.

### Workloads and the Well-Architected frameworks

The cloud frameworks do not define platforms, capabilities or building blocks, and they do not need to. They define the workload: the set of services, stores and nodes that together serve a business goal, judged against pillars. On the continuum a workload is what a product runs, so the pillars attach at two points. On a product, as the measures its state is judged by and the review a workload gets. On an architecture pattern or a reference architecture, as its Quality Attributes section, where each pillar becomes a scenario with a response measure, and where a hosting-profile pattern is the bundle's equivalent of a lens.

## What the repositories say today

The same words, as each repository uses them on 16 October 2026.

| Word | This bundle | architecture-pattern | patternode-architecture | LifeGuide |
|---|---|---|---|---|
| Landscape, layer | Not an entity | Not in scope | Platform of platforms, L0 to L4, still in patternode-platform | Platform architecture, L0 to L4, PL-01 to PL-08 |
| Platform | `PL-NNN`, replaces domain as the grouping | Not in scope; `platform` is a pattern scope | No platform page yet; products name a platform "not yet in the topology" | PL-01 to PL-08 in layers, each holding contexts |
| Domain | Replaced by platform | `domain` is a pattern scope | Four groups of contexts: trading, data, knowledge, platform | Core and supporting contexts |
| Capability | `CAP-NNN`, L1 to L3, maturity and stage | `realises: [CAP-NNN]` on an architecture pattern or a reference architecture | One area, thirteen L2 at R1, L3 inline | Not used |
| Product | Vendor offering on an SBB; "platform as a product" | Product is a kind of box | `PRD-NNN`, the consumable offering; technology; deliverable | Three products over one core platform |
| Bounded context | `BC-NNN`, one platform, contains ABBs | Not in scope | Ten target contexts; eight as built; no `BC-NNN` pages | Sixteen contexts, the authoritative master document |
| ABB | `ABB-NNN` inside a BC, with `requires` | A kind of box, catalogue level logical | Placeholder; every box local | Six, for persistence technology only |
| SBB | `SBB-NNN`, products, mapping, composite form | A kind of box, catalogue level physical | Placeholder | Six, for persistence technology only |
| Architecture pattern | `AP-NNN`, conceptual or logical, realises capabilities | The `architecture-pattern` type, bound by the repository, series `AP` | `AP-NNN`, two documents | Not used |
| Reference architecture | `RA-NNN`, physical, applies architecture patterns | The `reference-architecture` type, bound by the repository, series `RA` | `RA-NNN`, six documents | Not used |
| Service | `service` kind, one SBB, one BC, kebab id | Not in scope | "Deployable", in prose tables as built and target | Cloud Run services, Cloud Functions, MCP servers, no registry |
| Deployment node | `DN-NNN` reserved, undefined | Not in scope | Prose: GCE VM, Cloud Run, AWS accounts | Prose and Terraform |

## Where they disagree, and what the bundle does

Each disagreement below is real, and each has a resolution this page adopts. The resolutions change the bundle; they do not ask a repository to change its words where those words already work.

1. Domain against platform. The framework document says platform replaces domain. Patternode and LifeGuide both still need a word for subject matter. Resolution: both words stay, with different jobs. Platform is the unit of ownership and consumption. Domain is the demand space, recorded as the subdomain kind on each context and in a platform's purpose, never as a folder.
2. Reusable blocks against blocks inside a context. TOGAF's building blocks are reusable across the enterprise; the bundle puts each architecture building block inside one bounded context. Resolution: the context rule stays, because a block shared across languages is the coupling DDD exists to prevent. Reuse is through patterns, which name blocks from several contexts, and through cross-cutting platforms consumed through an adapter.
3. Architecture pattern against reference architecture. The bundle's metamodel had no entity for either; architecture-pattern makes every model a pattern with optional types; Patternode bound no types. Resolution: the continuum names two kinds of document and no bare pattern. An architecture pattern is conceptual or logical and technology-agnostic; a reference architecture is physical and technology-specific and applies one or more architecture patterns. Every document declares its type and takes that type's identifier series. The `pattern` skill remains the one tool that authors both, and its construct's two axes, scope and abstraction, are unchanged. The metamodel's Guidance grouping records this.
4. Product with three meanings. The bundle's SBB front matter said `products` for vendor offerings and the platform standard says "platform as a product". Patternode has settled the words. Resolution: adopt Patternode's. Product is the consumable offering, a new kind. Technology is the vendor's offering, and the SBB field is now `technologies`. A platform offers products.
5. Service against deployable. The bundle says service; Patternode says deployable; LifeGuide's services include functions and MCP servers. Resolution: service is the catalogue kind, deployable is its plain-language synonym, and the definition is C4's container narrowed to units that execute code. A unit that composes several contexts is recorded with that finding against it.
6. Which capability level maps to blocks. The capability standard says only L3 maps to building blocks; Patternode maps L2 and lists L3 inline. Resolution: blocks attach at the lowest level a capability is defined to, and L3 is optional.
7. Deployment node undefined. Resolution: define `DN-NNN` with account, region, runtime, scaling model and run-as identity, and make `deployed_to` on a service resolve to it.
8. No landscape or layer. Resolution: add Layer to the Organisation and Platform grouping, with `layer` on the platform and a landscape page that records the layers and the permitted dependency direction.
9. Stores. C4 counts a database as a container; the bundle's service executes code. Resolution proposed, not settled: a store is a resource owned by one context, recorded on the owning service and on its node. See the decisions below.
10. Problem space against demand space. Domain-driven design calls the side before any solution the problem space, and most of the literature follows it. Resolution: the bundle calls it the demand space, because what asks for architecture is as often an opportunity as a problem, and a capability or an outcome is demand whichever it is. Where a tradition is cited, its own word is kept beside the bundle's.

## Decisions for the owner

| # | Decision | Options | Recommended |
|---|---|---|---|
| D1 | A data store is a service, or a resource of one | A service in its own right, as C4 does; a resource recorded on the owning service and its node | A resource. A store has no code to release, and the ownership rule (one context, one store) is what matters |
| D2 | The SBB field for vendor offerings | Keep `products`; rename to `technologies` with an alias | Rename. Done: `technologies`; `products` is removed |
| D3 | Service identifiers | Kebab-case slug only; slug with `numeric_id: SV-NNN`; `SV-NNN` as the primary id | Slug with `numeric_id`, so a repository whose prose links identifiers can link `SV-NNN` while code keeps the slug |
| D4 | Where blocks attach | L3 only; the lowest defined level | The lowest defined level |
| D5 | Pattern types in the bundle's own guidance | Define architecture pattern and reference architecture as named types; leave every document untyped | Define the two types as required on the continuum, with the abstraction each expects, and let a repository that is not yet on it leave documents untyped |

## What changes in the bundle

In the order the work should be done.

1. The metamodel. Consolidate groupings 2 (Organisation and Platform, with Layer and Product), 5 (Solution Boundary), 6 (Runtime, with Service, Store and Deployment Node) and 8 (Guidance, with Architecture pattern and Reference architecture) against this page.
2. The frontmatter standard and schemas. Done: `DN-NNN` is defined; the `product`, `feature`, `store` and `landscape` kinds exist; the platform has `landscape` and `layer`, the service `run_by` and `stores`, the SBB `technologies`; the use case links its capabilities, features and realising pattern; and patterns list the blocks they compose. [The schema on the continuum](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/schema.md) draws the schemas in this page's layout and is checked against its picture.
3. The skills. `/architecture service` writes a folder per service as every other skill does, and links the product that runs it; a new `/architecture product` writes a product with its state and required capabilities and checks the state against the stages; `/architecture platform` records the layer.
4. The documents. The concepts page and the framework document point here for definitions; the traceability standard carries the relationships table above.
5. The exemplar. Patternode's architecture repository applies the runtime level first: a register of its services and nodes as built and as targeted, each service carrying its context, its code path and its findings against the target, and one service traced back through solution building block, architecture building block, bounded context and capability to the platform that owns it.

## Sources

Standards and frameworks, current editions.

- The Open Group, [TOGAF Standard, 10th Edition](https://www.opengroup.org/togaf) (2022), with the Series Guide: Business Capabilities, version 2 (2022). The public introduction to building blocks is the older [Introduction to Building Blocks](https://pubs.opengroup.org/architecture/togaf7-doc/arch/p4/bbs/bbs_intro.htm); the definitions are unchanged in substance.
- The Open Group, [Open Agile Architecture, O-AA](https://pubs.opengroup.org/architecture/o-aa-standard-single) (2020).
- The Open Group, ArchiMate 3.2 Specification (2022); the [3.1 technology layer](https://pubs.opengroup.org/architecture/archimate31-doc/chap10.html) is public.
- OMG, [Unified Modeling Language 2.5.1](https://www.omg.org/spec/UML/2.5.1) (2017), clauses 11.7 (collaborations and collaboration uses) and 18.1 (use cases, realised by collaborations); Jacobson, Booch and Rumbaugh, The Unified Software Development Process (1999), the use-case realization.
- [ISO/IEC/IEEE 42010:2022](https://committee.iso.org/standard/74393.html), Software, systems and enterprise, Architecture description.
- AWS, [Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) and [REL03-BP02](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_service_architecture_business_domains.html); AWS Prescriptive Guidance, [Decompose by subdomain](https://docs.aws.eu/prescriptive-guidance/latest/modernization-decomposing-monoliths/decompose-subdomain.html) and [Building hexagonal architectures on AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/hexagonal-architectures/welcome.html).
- Microsoft, [Azure Well-Architected Framework workloads](https://learn.microsoft.com/en-us/azure/well-architected/workloads) and the Azure Architecture Center on [tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd) and [microservice boundaries](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries).
- Google Cloud, [Well-Architected Framework](https://docs.cloud.google.com/architecture/framework).
- Simon Brown, the C4 model: [Container](https://c4model.com/abstractions/container) and [Component](https://c4model.com/abstractions/component).
- Backstage, [System model](https://backstage.spotify.com/docs/portal/core-features-and-plugins/catalog/system-model.md) and [Descriptor format](https://backstage.spotify.com/docs/portal/core-features-and-plugins/catalog/descriptor-format).
- CNCF, [Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/) (2023) and [Platform Engineering Maturity Model](https://tag-app-delivery.cncf.io/wgs/platforms/maturity-model/readme).
- Team Topologies, [second edition](https://itrevolution.com/book/team-topologies/) (IT Revolution, 2025) and [Independent Service Heuristics](https://teamtopologies.com/ish).

Books and articles.

- Eric Evans, Domain-Driven Design (2003); Vaughn Vernon, [Implementing Domain-Driven Design](https://www.oreilly.com/library/view/implementing-domain-driven-design/9780133039900/ch02lev1sec5.html) (2013); Martin Fowler, [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html).
- Vlad Khononov, Learning Domain-Driven Design (2021) and Balancing Coupling in Software Design (2024).
- Nick Tune and Jean-Georges Perrin, [Architecture Modernization](https://gotopia.tech/books/94/architecture-modernization-socio-technical-alignment-of-software-strategy-and-structure) (Manning, 2024).
- Gregor Hohpe, [Platform Strategy: Innovation Through Harmonization](https://leanpub.com/platformstrategy) (2024); Evan Bottcher, What I Talk About When I Talk About Platforms (2018).
- Mark Richards, Neal Ford and Perry Daniels, [Fundamentals of Software Architecture, 2nd edition](https://www.oreilly.com/library/view/-/9781098175504) (O'Reilly, 2025).
- Len Bass, Paul Clements and Rick Kazman, Software Architecture in Practice, [Architectural Patterns, Reference Models, and Reference Architectures](https://people.ece.ubc.ca/matei/EECE417/BASS/ch02lev1sec3.html).
- Philippe Kruchten on reference architectures, and Angelov, Grefen and Greefhorst (2012), as surveyed in [Towards suitable description of reference architectures](https://peerj.com/articles/cs-392); Robert Cloutier and colleagues, The Concept of Reference Architectures, Systems Engineering (2010).
- Alistair Cockburn, Hexagonal Architecture (2005); Sam Newman, Building Microservices (2nd edition, 2021); Michael Nygard, Documenting Architecture Decisions (2011), and MADR.
- Patternode: [Product and Capability Model](https://github.com/patternode/patternode-architecture/blob/main/governance/product-capability-model.md), Target State, Platform Components and Pattern Specification. LifeGuide: Bounded Contexts and Platform Architecture.
