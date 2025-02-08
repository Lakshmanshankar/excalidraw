import { type FileTree, type FileNode } from './tree.run';

export function addNode(tree: FileTree, parentFolderId: string, newNode: FileNode) {
    if (parentFolderId === '') {
        const canAddNewNode =
            tree.recent.every((recentNode) => recentNode.id !== newNode.id) ||
            tree.recent.length === 0;
        if (canAddNewNode && newNode.type === 'file') {
            tree.recent.push(newNode);
        }
        return;
    }
    for (const node of tree.children) {
        if (addNodeHelper(node, parentFolderId, newNode)) {
            return;
        }
    }
    return tree;
}

function addNodeHelper(
    currentNode: FileNode,
    parentContainerId: string,
    newNode: FileNode,
): boolean {
    if (currentNode.id === parentContainerId && currentNode.type === 'folder') {
        currentNode.children.push(newNode);
        return true;
    }

    for (const childNode of currentNode.children) {
        if (addNodeHelper(childNode, parentContainerId, newNode)) {
            return true;
        }
    }
    return false;
}

export function updateNode(tree: FileTree, folderId: string, newProperties: Partial<FileNode>) {
    if (!newProperties.id) return tree;

    if (!folderId) {
        tree.recent = tree.recent.map((item) =>
            item.id === newProperties.id ? { ...item, ...newProperties } : item,
        );
        return tree;
    }
    for (const node of tree.children) {
        if (updateFolderHelper(node, folderId, newProperties)) {
            return tree;
        }
    }
    return tree;
}

function updateFolderHelper(
    root: FileNode,
    fileId: string,
    newProperties: Partial<FileNode>,
): boolean {
    if (root.id === fileId) {
        Object.assign(root, newProperties);
        return true;
    }

    for (const node of root.children) {
        if (updateFolderHelper(node, fileId, newProperties)) {
            return true;
        }
    }

    return false;
}

export function getParentNodeId(tree: FileTree, searchNodeId: string): string | null {
    if (tree.recent) {
        const searchNode = tree.recent.filter((recentNode) => recentNode.id === searchNodeId)?.[0];
        if (searchNode?.id) {
            return null;
        }
    }
    for (const node of tree.children) {
        const parent = getParentNodeIdHelper(node, searchNodeId);
        if (parent !== null) {
            return parent;
        }
    }
    return null;
}

function getParentNodeIdHelper(node: FileNode, searchNodeId: string): string | null {
    for (const childNode of node.children) {
        if (childNode.id === searchNodeId) {
            return node.id;
        }
    }

    for (const childNode of node.children) {
        const res = getParentNodeIdHelper(childNode, searchNodeId);
        if (res !== null) {
            return res;
        }
    }

    return null;
}

export function removeNode(tree: FileTree, nodeId: string): boolean {
    console.log('is ocmming');
    if (tree.recent) {
        const isNodeInRecent = tree.recent.every((node) => node.id === nodeId);
        console.log(isNodeInRecent, 'yepa');

        if (isNodeInRecent) {
            tree.recent = tree.recent.filter((node) => node.id !== nodeId);
            return true;
        }
    }
    const parentFolderId = getParentNodeId(tree, nodeId);
    if (!parentFolderId) {
        return false;
    }
    for (const node of tree.children) {
        if (removeNodeHelper(node, parentFolderId, nodeId)) {
            return true;
        }
    }
    return false;
}

function removeNodeHelper(node: FileNode, targetContainerId: string, nodeId: string): boolean {
    if (node.id === targetContainerId) {
        node.children = node.children.filter((childNode) => childNode.id !== nodeId);
        return true;
    } else {
        for (const childNode of node.children) {
            if (removeNodeHelper(childNode, targetContainerId, nodeId)) {
                return true;
            }
        }
        return false;
    }
}

export function moveNode(
    tree: FileTree,
    sourceNodeId: string,
    destinationContainerId: string,
): boolean {
    const sourceNode = findeNode(tree, sourceNodeId);
    console.log(sourceNode, 'SOURCE');
    if (!sourceNode) {
        console.error('Source node not found');
        return false;
    }

    const removed = removeNode(tree, sourceNodeId);
    console.log(tree.recent);
    if (!removed) {
        console.error('Failed to remove the node from its original location');
        return false;
    }

    addNode(tree, destinationContainerId, sourceNode);
    return true;
}

function findeNode(tree: FileTree, nodeId: string): FileNode | null {
    if (tree.recent) {
        console.log(tree.recent, 'RECERNT');

        const res = tree.recent.filter((node) => {
            console.log(node.id, nodeId);
            return node.id === nodeId;
        })?.[0];

        console.log(res, 'response');
        if (res) {
            return res;
        }
    }
    for (const child of tree.children) {
        const res = findNodeHelper(child, nodeId);
        if (res) {
            return res;
        }
    }
    return null;
}

function findNodeHelper(node: FileNode, nodeId: string): FileNode | null {
    if ('id' in node && node.id === nodeId) {
        return node;
    }

    if ('children' in node && Array.isArray(node.children)) {
        for (const child of node.children) {
            const found = findNodeHelper(child, nodeId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}
