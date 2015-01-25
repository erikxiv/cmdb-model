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
* type - Used to differentiate between different types of artefacts (e.g. machines, services, databases or whathaveyou). May not be changed once created.
* revision - The current version of this specific configuration item. Any update will increment this value by one

#### Custom properties

Any properties you like, most likely different for each type of configuration item (e.g. IP, DNS, port, endpoint etc)

#### Relationships

Relationships from this particular configuration item to other configuration items.

#### Javascript syntax

```
{
    id: 'importantMachine',
    type: 'machine',
    revision: 3,
    properties: {
        ip: '192.168.0.3',
        name: 'importantMachine'
    },
    relationships: {
        dns: 'dnsMachine',
        router: 'routerMachine'
    }
}
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
            updateType: 'added',
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
            updateType: 'modified',
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
            updateType: 'deleted',
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

## cmdb-repository interface

### Repositories

* createRepository(name) - create a new repository
* deleteRepository(name) - delete an existing repository

### Browse repository

* getConfigurationItems(repo[, type, options]) - list all configuration items in repository
* getConfigurationItem(repo, ci) - retrieve a configuration item
* getChanges([lastRevision, options]) - retrieve the last changes to the repository (see #changeInformation for format)

### Update repository
Should be called by adapters to repository sources. Can follow two paradigms - either a source that is capable of detecting changes where the cmdb-model is invoked with incremental updates (incremental paradigm) or a source where a full extraction is made and compared to previous state to determine changes made (comparison paradigm).

#### incremental paradigm

* sourceChanged(info) - change repository information (see #changeInformation for format)

#### comparison paradigm

* sourceData(data) - change repository information (see #replaceInformation for format)

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
