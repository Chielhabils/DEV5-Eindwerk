# HADES API

---

## Table of Contents

- [What does it do?](#what-does-it-do)
- [Getting started](#getting-started)
- [How it works](#how-it-works)
    - [Boons](#tickets-table)
    - [Gods](#organisations-table)
- [Status and roadmap](#project-status)
- [FAQ](#faq)

---
## What does it do?

Built for the popular game Hades, the Hades API allows the user to save boons they want to use or sort to a database. These boons will be sorted by their respective gods. This allows for build creation and customization.

---
## Getting started

1. Clone this repository.
2. Navigate to the root folder and boot up the Docker container. For more information regarding Docker, please refer to [their documentation](https://docs.docker.com/).
    ```shell
    docker-compose build
    docker-compose up
    ```
3. To run tests, navigate to the api folder.
    ```shell
    npm test
    ```
4. To see the content in the PostgreSQL database, I recommend using a GUI tool such as TablePlus. You can get it [here](https://tableplus.com/).

---
## How it works

By using the CRUD endpoints, users can access the boons table to add, remove or get boons from the database.

#### Boons


You can modify this table by using the following endpoints:

- `GET /boons`
    - Returns all boons from the database.
- `GET /boon/:uuid`
    - Returns a specific boon by uuid.
- `POST /postboon`
    - Saves a boon to the database.
    - Requires a body with the following properties: 
        ```js
        {
            content: String,
            godid: String
        }
        ```
- `DELETE /deleteboon`
    - Deletes a specific boon by uuid.
    - Requires a body which includes the uuid as a string: 
        ```js
        {
            uuid: "babf5fb0-4d18-11eb-864f-f9e4749272ab"
        }
        ```

## Project Status

This project is in development.

---
## FAQ

**Q: I'm having trouble setting up my development environment, can you help me?**

A: Please refer to [the contribution guidelines](CONTRIBUTING.md) for more information.

**Q: Can I use this project for commercial or private use?**

A: This project falls under the MIT License which allows you to do that. For more information, take a look at [the detailed license](LICENSE.md).
