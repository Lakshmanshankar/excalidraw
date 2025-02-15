## Frontend Tasks

## core
[ ] Load scene from file
[ ] Save current excalidraw file
    - if no fileNode is set(treat it as new file and save to recent)
    - update file in-place, update file-tree if needed(on property change).
[ ] Add **create** folder and file options within folder node.
[ ] Render File tree
[ ] Implement drag and drop(pragmatic dnd)(Optional)


## performance
[ ] Need to stop refetch every time the file tree is mounted.(see if we can use react query with cache to optimize the performance)
