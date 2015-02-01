# cmdb-model

Important Note: This module is not even remotely finished.

## Why?

* Existing CMDB implementations often try to do all, but fail on a few fronts
* Existing CMDB implementations often focus on mostly networks and servers (and thus fail in other areas)

## When?
* For those who easily want to capture configuration item information from multiple sources easily
* For those who flexibly want to restructure information from multiple sources to create actionable data for the CM team
* For those whose datasets are relatively small (fits into memory)

## Installation & Setup

* npm install cmdb-model (TODO)
* Configure (see below)
* node lib/cmdb-model.js

## Information Model

### ConfigurationItem

Basic building block of any Configuration Management Database (CMDB). An item that we want to keep track of.

#### Standard properties

* id - unique, persistent identifier for this configuration item (unique within the specific repository). May not be changed once created.
* revision - The current version of this specific configuration item. Any update will increment this value by one

#### Custom properties

Any properties you like, most likely different for each type of configuration item (e.g. IP, DNS, port, endpoint etc)

#### Relationships

Relationships from this particular configuration item to other configuration items.

#### Javascript syntax

```
{
    id: 'importantMachine',
    revision: 3,
    properties: {
        type: 'machine',
        ip: '192.168.0.3',
        name: 'importantMachine'
    },
    relationships: {
        dns: 'dnsMachine',
        router: 'routerMachine'
    }
}
```

#### RDF/Turle representation

```
repo:importantMachine
    rdf:type cmdb:ci;
    cmdb:id 'importantMachine';
    cmdb:revision 3;
    repo:type 'machine';
    repo:ip '192.168.0.3';
    repo:name 'importantMachine';
    repo:dns repo:dnsMachine;
    repo:router repo:routerMachine .
```

### Repository

Represents a cmdb repository

#### Javascript syntax

```
{
    id: 'domainX',
    revision: 234
}
```

### Change

Represents an atomic change to a CMDB repository, including modifications to one or more configuration items.

#### Javscript syntax

```
{
    revision: 235, // new revision for the repository incurred by this change
    updates: [ // a list of configuration items that have been modified (added, modified or deleted)
        {
            id: 'newMachine',
            operation: 'create',
            before: {},
            after: {
                id: 'newMachine',
                type: 'machine',
                properties: { ... },
                relationships: { ... }
            }
        },
        {
            id: 'newMachine',
            operation: 'update',
            before: {
                id: 'newMachine',
                type: 'machine',
                properties: {
                    ip: '10.1.2.3'
                },
                relationships: { ... }
            }
            after: {
                id: 'newMachine',
                type: 'machine',
                properties: {
                    ip: '10.1.2.4'
                },
                relationships: { ... }
            }
        },
        {
            id: 'newMachine',
            operation: 'delete',
            before: {
                id: 'newMachine',
                type: 'machine',
                properties: { ... },
                relationships: { ... }
            },
            after: {}
        }
    ]
}
```

#### RDF/Turtle syntax

```
repoc:235
    rdf:type cmdb:change;
    cmdb:revision 235;
    cmdb:update _:1;
    cmdb:update _:2;
    cmdb:update _:3 .
_:1
    cmdb:id 'newMachine';
    cmdb:operation 'create';
    cmdb:before _:b1;
    cmdb:after _:a1 .
_:2
    cmdb:id 'newMachine';
    cmdb:operation 'update';
    cmdb:before _:b2;
    cmdb:after _:a2 .
_:3
    cmdb:id 'newMachine';
    cmdb:operation 'delete';
    cmdb:before _:b3;
    cmdb:after _:a3 .
_:a1
    cmdb:id 'importantMachine';
    repo:type 'machine' .
_:b2
    cmdb:id 'importantMachine';
    repo:type 'machine';
    repo:ip '10.1.2.3' .
_:a2
    cmdb:id 'importantMachine';
    repo:type 'machine';
    repo:ip '10.1.2.4' .
_:b3
    cmdb:id 'importantMachine';
    repo:type 'machine' .
```

## cmdb interface

* createRepository(name) - create a new repository
* getRepository(name) - get an existing repository
* deleteRepository(name) - delete an existing repository
* deleteAllRepositories() - delete all repositories
* searchRepositories([options]) - search for repositories

## repository interface

### Configuration Items

* createCI(ci[, options])
* getCI(id[, options])
* updateCI(ci[, options])
* deleteCI(id[, options])
* searchCI([options])

### Changes

* createChange(change[, options])
* getChange(change[, options])
* searchChange([options])

### Compare
Returns a change with differences. Useful when (1) updating the repository from a source where the full data is extracted periodically and (2) to compare as-is, to-be scenarios. Requires ci ids to be the same (use ci id to diff individual cis). 

* compare(otherRepositoryName)
* compare(Array of cis)

# Unsorted

CMDB Discovery

Service Interface
- Updates are published to interested subscribers (CUD)
- Queries over the data model can be made
- (Invalid entries are published as part of the data model)

Adapter Interface
- Updates are published to main data model

Data Model
- Resources
-- Required properties: id, repository, version (..., using subversion model? branching?)
-- May have other properties (primarily primitives, possibly complex primitives)
- Relations
-- Subclass of Resource
-- Required extra properties: fromResource, toResource
- Change (e.g. update, think RSS feed)
-- Linearly counted for the specific repository
-- Contains resources affected and whats changed (CUD + details)

Adapter Process
- Updates from source repositories using available mechanism (custom)
- Adapter stores current state, and can use that for extracting updates or comparing to baseline
- A new set of changes is persisted and published to interested parties
