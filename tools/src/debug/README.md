# DEBUG Nx Plugin

A plugin that provides a set of tools to debug your Nx workspace.

## Usage

Register the plugin in your `nx.json`

```jsonc
// nx.json
{
  //...
  "plugins": ["tools/src/debug/debug.plugin.ts"]
}
```

### Options

You can configure the plugin by providing options object in addition to the plugin path

**Options:**

| Name       | Type     | Default                     | Description               |
| ---------- | -------- | --------------------------- | ------------------------- |
| `tsconfig` | `string` | `tools/tsconfig.tools.json` | The tsconfig file to use. |

Example:

```jsonc
// nx.json
{
  //...
  "plugins": [
    {
      "plugin": "tools/src/debug/debug.plugin.ts",
      "options": {
        "tsconfig": "tools/tsconfig.tools.json"
      }
    }
  ]
}
```

### Targets

#### `list-process`

Lists all the processes running in the workspace.

Options:

| Name            | Type     | Default     | Description                  |
| --------------- | -------- | ----------- | ---------------------------- |
| `pidFilter`     | `number` | `undefined` | Filter processes by PID.     |
| `commandFilter` | `string` | `undefined` | Filter processes by command. |
| `slice`         | `number` | `undefined` | Slice the list of processes. |

Example:

- `nx run <project-name>:list-process`
- `nx run <project-name>:list-process --pidFilter=1234`
- `nx run <project-name>:list-process --commandFilter=verdaccio`
- `nx run <project-name>:list-process --commandFilter=verdaccio --pidFilter=1234`
- `nx run <project-name>:list-process --commandFilter=verdaccio --slice=5`

#### `kill-process`

Kills a process by its PID or filter

Options:

| Name            | Type     | Default     | Description                  |
| --------------- | -------- | ----------- | ---------------------------- |
| `pidFilter`     | `number` | `undefined` | Filter processes by PID.     |
| `commandFilter` | `string` | `undefined` | Filter processes by command. |

Example:

- `nx run <project-name>:kill-process --pidFilter=1234`
- `nx run <project-name>:kill-process --commandFilter=verdaccio`
