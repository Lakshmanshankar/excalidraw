import { addNode, updateNode, moveNode } from './tree';

export type FileNode = {
    id: string; // uuid-v4
    name: string;
    type: 'folder' | 'file';
    children: FileNode[];
};

export type FileTree = {
    _id: string;
    ownerID: string;
    children: FileNode[];
    recent: FileNode[]; // just single lvl only.
};

//TEST: CASES

const C: FileNode = {
    id: 'cfile',
    name: 'c',
    type: 'folder',
    children: [],
};

const B: FileNode = {
    id: 'bfile',
    name: 'b',
    type: 'folder',
    children: [C],
};

const A: FileNode = {
    id: 'afile',
    name: 'a',
    type: 'folder',
    children: [B],
};

const C1: FileNode = {
    id: 'c1file',
    name: 'c1',
    type: 'folder',
    children: [],
};

const B1: FileNode = {
    id: 'b1file',
    name: 'b1',
    type: 'folder',
    children: [C1],
};

const A1: FileNode = {
    id: 'a1file',
    name: 'a1',
    type: 'folder',
    children: [B1],
};

export const fileTree: FileTree = {
    _id: '67846af8079520e3d5d53dba',
    ownerID: '1',
    children: [A, A1],
    recent: [],
};

const fileC: FileNode = {
    id: 'cfilee',
    name: 'cf',
    type: 'file',
    children: [],
};

const nestedChild: FileNode = {
    id: 'nested_chil',
    name: 'nft',
    type: 'file',
    children: [],
};

const fileD: FileNode = {
    id: 'sibllingA2',
    name: 'a2',
    type: 'folder',
    children: [nestedChild],
};

addNode(fileTree, 'bfile', fileC);
addNode(fileTree, 'afile', fileD);
updateNode(fileTree, 'cfile', { name: 'LeastFile' });
updateNode(fileTree, 'sibllingA2', {
    name: 'somthing off the guard',
});

addNode(fileTree, '', fileC);
moveNode(fileTree, 'cfilee', 'b1file');
addNode(fileTree, 'cfile', fileD);
console.log(JSON.stringify(fileTree, null, 4));
