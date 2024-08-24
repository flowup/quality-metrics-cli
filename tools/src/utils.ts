import {
  ProjectGraph,
  TargetConfiguration,
  readCachedProjectGraph,
} from '@nx/devkit';

export async function getAllDependencies(
  projectName: string,
): Promise<string[]> {
  // TODO check if the caching problems are introduced by readCachedProjectGraph
  const projectGraph: ProjectGraph = await readCachedProjectGraph();

  // Helper function to recursively collect dependencies
  const collectDependencies = (
    project: string,
    visited: Set<string> = new Set(),
  ): Set<string> => {
    // If the project has already been visited, return the accumulated set
    if (visited.has(project)) {
      return visited;
    }

    // Add the current project to the visited set
    const updatedVisited = new Set(visited).add(project);

    // Get the direct dependencies of the current project
    const dependencies = projectGraph.dependencies[project] || [];

    // Recursively collect dependencies of all direct dependencies
    return dependencies.reduce((acc, dependency) => {
      return collectDependencies(dependency.target, acc);
    }, updatedVisited);
  };

  // Get all dependencies, then remove the original project (optional)
  const allDependencies = collectDependencies(projectName);
  allDependencies.delete(projectName);

  return Array.from(allDependencies).filter(dep => !dep.startsWith('npm:'));
}

export function someTargetsPresent(
  targets: Record<string, TargetConfiguration>,
  targetNames: string | string[],
): boolean {
  const searchTargets = Array.isArray(targetNames)
    ? targetNames
    : [targetNames];
  return Object.keys(targets).some(target => searchTargets.includes(target));
}
