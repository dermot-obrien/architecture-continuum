---
document_type: standards
title: "Building Block Calibration Standard"
classification: internal
version: 1.0.0
status: draft
created: 2026-10-16
last_modified: 2026-10-16
owner: "Architecture Team"
triggers:
  - "Deciding whether something is an ABB, an SBB, a component inside one, or a whole system"
  - "Creating or reviewing an ABB or SBB, before its identifier is assigned"
  - "Drawing a C4 context, container or component view of a capability"
  - "Promoting an architecture pattern's local roles to ABBs, or its ABBs to the SBBs of a reference architecture"
  - "Reviewing a catalogue, an architecture pattern or a reference architecture for building blocks that are too fine or too coarse"
---

# Building Block Calibration Standard

This standard fixes the grain of an Architecture Building Block (ABB) and a Solution Building Block (SBB). Both are calibrated against the C4 model: an ABB or an SBB is a C4 container, never anything smaller and never a whole system. Every other standard that creates, draws or links building blocks applies this one first, because an identifier assigned at the wrong grain is the most expensive thing to undo in a catalogue.

The rule in one line: no ABB or SBB exists below the container level. There is never an ABB or an SBB for a component or for code.

> **Cross-references:**
> - [ABB Document Standard](./architecture-building-blocks/standard-abb-document.md): what an ABB document holds, once the grain is right.
> - [SBB Document Standard](./solution-building-blocks/standard-sbb-document.md): what an SBB document holds, including the composite form.
> - [C4 System Context Diagram Standard](./standard-c4-context-diagram.md): the context view, which belongs to a capability.
> - [Definition Ladder Standard](../capabilities/standard-definition-ladder.md): how architecture patterns, reference architectures, ABBs and SBBs evidence a capability's stage.
> - [Traceability & Hierarchy Standard](../standard-traceability.md): the golden thread the grain sits in.

## 1. The C4 levels

C4 is a notation of zoom levels. Each level has a test for what belongs on it, and the tests are what this standard borrows.

| C4 element | C4's own test | Grain |
|---|---|---|
| Person | A human who uses the system | Actor |
| Software System | The highest level of abstraction: something that delivers value to its users and that a stakeholder would name | System |
| Container | A separately runnable or deployable unit that executes code or stores data: an API, a web application, a database, a message broker, a function, a command-line tool | Container |
| Component | A grouping of related functionality behind a well-defined interface, inside a container, and not separately deployable | Component |
| Code | Classes, functions, modules, tables | Code |
| Deployment node | Infrastructure a container runs on: a cluster, a virtual machine, a region, an execution environment | Infrastructure |
| Relationship | An interaction between two elements, with a verb and, below the context level, a technology | Edge |

C4 also has three supplementary views: the system landscape (many systems), the dynamic view (one flow in sequence) and the deployment view (containers placed on nodes).

## 2. The alignment

| C4 element | AAA construct | Rule |
|---|---|---|
| Person | None | Persons appear on the context diagram only. No artefact is created for a person ([C4 Context Standard](./standard-c4-context-diagram.md)). |
| Software System | A Capability (L3), with its Bounded Context as the boundary | A system is a capability realised by a set of ABBs, never one ABB. The context diagram belongs to the capability. There is no top-level ABB. |
| Container | ABB, then SBB, then Service | One chain at one grain. The ABB is the container as a technology-agnostic role. The SBB is the same container with its products chosen. The Service is the same container as it runs. |
| Component | The components listed in the ABB document (section 2.2) and mapped in the SBB document (section 2.2) | Components are rows and bullets inside a building block's document. They carry no identifier of their own, no folder and no front matter. |
| Code | Nothing in the architecture | Code lives in the implementation repository and is reached from an SBB or Service by link. |
| Deployment node | Infrastructure, recorded on a deployment view or as a Deployment Node (`DN-NNN`) where the workspace keeps them | Infrastructure that containers run on is not a container and is not drawn as a box in a container-grain pattern. |
| Relationship at context level | A capability-to-capability or actor-to-capability interaction | A verb label, no protocol. Not an `I<N>` interface. |
| Relationship at container level | An ABB interface (`I<N>`), realised by an SBB port or connector with its protocol | The ABB owns the contract; the SBB owns the protocol and product wiring. |
| Container diagram | An architecture pattern or a reference architecture | The container diagram of a capability at one of three abstractions: an architecture pattern at conceptual (local roles) or logical (ABBs), a reference architecture at physical (SBBs). The abstraction is derived from the boxes ([Definition Ladder Standard, section 2.1](../capabilities/standard-definition-ladder.md#21-a-patterns-abstraction)). |
| Component diagram | The ABB's component diagram (section 2.1 of its document) | One container opened up. The boxes inside are components, never ABBs. |
| System landscape | A Platform (`PL-NNN`) and the capabilities it provides | The platform diagram standard covers it. |
| Dynamic view | The scenarios of an architecture pattern or a reference architecture, stepping between its boxes over its interfaces | Unchanged. |
| Deployment view | Services placed on deployment nodes | The runtime grouping covers it. |

## 3. The container test

Apply the test before assigning an identifier. Ask of the candidate:

1. Does it run as its own process, or is it deployed on its own?
2. Does it hold its own data, as a store with its own lifecycle?
3. Could it be replaced by a different product without rebuilding its neighbours?
4. Would a team own, version or scale it separately?

| Answers | Verdict | Where it goes |
|---|---|---|
| Yes to the first or second question, and usually the third | A container | An ABB, realised by an SBB, deployed as a Service |
| No to all four, and it lives inside something that passed | A component | A row in its container's ABB document (section 2.2) and SBB product mapping |
| It is made of several things that passed, and a stakeholder would name the whole | A system | A Capability with a Bounded Context, and an architecture pattern over its ABBs |
| Containers run on it | A deployment node | A deployment view, not a building block |
| A class, a function, a module, a table, a prefix in a store | Code, or a detail of a container | The repository, or a sentence in the container's document |

### 3.1 Worked verdicts

| Candidate | Verdict | Why |
|---|---|---|
| An API gateway | Container, so an ABB | Deployed on its own; swappable product |
| A message broker | Container, so an ABB | Runs on its own; holds its own data |
| A relational database | Container, so an ABB | A store with its own lifecycle |
| An identity provider | Container, so an ABB | Deployed on its own; every other container talks to it |
| A serverless function with its own trigger | Container, so an ABB | Deployed on its own, however small |
| A command-line tool a person runs | Container, so an ABB | Runs as its own process, with its own release |
| A parsing stage inside a pipeline task | Component | Runs inside the task's process; not deployable on its own |
| A scope filter inside an API | Component | Behind the API's interface; not separable |
| A prefix or zone inside an object store | A detail of the store | One bucket is one container; its zones are a sentence or a table in its document |
| A trading platform, a payments system, a knowledge lab | System, so a Capability | A stakeholder names the whole; it is made of containers |
| A compute cluster, a virtual network, a region | Deployment node | Containers run on it |
| An infrastructure-as-code module | Not a block | It provisions one or more containers and nodes; those are the blocks |
| A class or a function | Code | Lives in the repository |

## 4. Below the container: components and code

No ABB or SBB is ever created for a component or for code. This is the rule most often broken, and it is broken by zooming in: a diagram opens a container, the pieces inside look like blocks, and each gets an identifier. They are components. They go in the ABB document as a bullet under section 2.2 and in the SBB document as a row of the product mapping, and nowhere else.

A component is promoted to an ABB only when it comes to pass the container test: it gains its own deployment, its own data store or its own lifecycle. Promotion is a new ABB with a new identifier, and the component's row is removed from its former container's document.

An existing ABB or SBB that fails the container test is folded into the container it belongs to. Its content becomes a component entry in that container's document, its identifier is retired and never reused, and its revision history records the fold with a link to the container. Interfaces it declared become internal to the container and are removed from the interface table, unless they cross the container's boundary, in which case they move to the container's own table.

## 5. Above the container: systems, architecture patterns and reference architectures

A system is not an ABB. The ABB document standard and the C4 context standard once allowed a top-level ABB to stand for a whole system and carry its context diagram. Under this standard the context diagram belongs to the capability, the system's containers are the capability's ABBs, and the architecture pattern that realises the capability is its container diagram, made concrete by a reference architecture.

The three abstractions are the same container diagram three times: an architecture pattern with local roles before the catalogue knows the containers, an architecture pattern with ABBs once it does, and a reference architecture with SBBs once products are chosen. A box in either kind must therefore pass the container test whatever the abstraction. A local role that would not pass it is a component of another box and is folded into that box's row, so that promoting the roles later produces ABBs at the right grain.

A composite SBB is read with this rule. An SBB whose parts are themselves SBBs with their own deployment is a system at container grain, and that is a reference architecture realising the capability, not an SBB. The composite form in the [SBB Document Standard](./solution-building-blocks/standard-sbb-document.md#composite-sbbs) is kept for one deployable unit with internal seams worth naming, such as a product family that ships as one deployment. Where the parts would each pass the container test, write a reference architecture.

## 6. Infrastructure and cross-cutting blocks

Infrastructure that containers run on is a deployment node. Catalogued infrastructure blocks such as a compute orchestration platform or a network connectivity block are kept for the deployment view and for the capabilities they realise. They are not drawn as boxes in an architecture pattern or a reference architecture, because every box in either must be a container that runs on them.

The three cross-cutting concerns every ABB and SBB addresses (identity and access, observability, governance and policy) are containers in their own right, catalogued once as ABBs and realised once as SBBs. A block's cross-cutting sections (2.5 to 2.7 of its document) say how it uses those containers. Drawing the three as groups inside a component diagram is a presentation convention of the diagram standards and creates no building block.

## 7. Persons and external systems

A person has no artefact. An external system a container depends on is either an ABB the workspace declares in `requires` or an external node with no artefact, exactly as the [C4 Context Standard](./standard-c4-context-diagram.md#how-c4-context-maps-onto-aaa-constructs) says. An external system is never given an ABB or SBB merely so that it can be drawn.

## 8. Calibrating a catalogue, an architecture pattern or a reference architecture

A calibration review walks every block and applies the container test. The outcome for each block is one of:

| Outcome | Action |
|---|---|
| Passes | Nothing |
| Fails, and belongs inside a container | Fold it into that container (section 4) |
| Is a system | Replace it with a capability and an architecture pattern; its former components become the boxes if they pass the test |
| Is a deployment node | Keep it for the deployment view; remove it from architecture patterns and reference architectures |

A fold or a replacement changes nothing on the definition ladder by itself. R2 asks that the building blocks a capability needs are named, and naming them at the right grain is what the review does. A stage is lost only where the evidence a stage requires was attached to a retired block and has not been carried to its container.

## 9. What this standard changes in its neighbours

| Standard | Before | Now |
|---|---|---|
| ABB Document Standard, section 2.1.1 | A top-level ABB carries the context diagram | The capability carries it; an ABB is never a system |
| C4 Context Standard, mapping table | The boundary is a Capability or a top-level ABB | The boundary is a Capability |
| SBB Document Standard, composite SBBs | Parts independently deployed make an SBB composite | Parts independently deployed make a system, written as a reference architecture |
| Definition Ladder Standard, section 2.1 | The abstraction of an architecture pattern or a reference architecture is derived from its boxes | Unchanged, with the added requirement that every box is a container |

## AI Agent Self-Verification Checklist

Before assigning or keeping an ABB or SBB identifier, verify:

1. [ ] **Container test.** Does the block pass the test in section 3: its own process or deployment, or its own data, and replaceable on its own?
2. [ ] **Nothing below.** Is there no ABB or SBB for anything that is a component or code? Do components appear only as rows and bullets inside their container's document?
3. [ ] **Nothing above.** Is there no ABB that stands for a whole system? Does the system have a Capability, and does the context diagram sit on the capability?
4. [ ] **Boxes.** Does every box in an architecture pattern or a reference architecture pass the container test, whatever its abstraction?
5. [ ] **Composite.** Where an SBB is composite, do its parts fail the container test on their own? If they would pass, is it written as a reference architecture instead?
6. [ ] **Infrastructure.** Are deployment nodes kept off architecture patterns and reference architectures?
7. [ ] **Folds recorded.** Where a block was folded or replaced, does its revision history say so and link to its container or capability, and is its identifier retired?
