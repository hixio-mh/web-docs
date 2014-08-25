# NGN TreeItem

Tree items are the nodes of a tree. They can be nested, dragged/dropped, and customized in any way. Each tree item
is a row that can have any number of columns.

```
<ngn-tree modify="false">
  <ngn-treeitem label="Item A">
    <div>test col</div>
    <div>test col 2</div>
  </ngn-treeitem>
  <ngn-treeitem label="Item B" collapsed="false">
    <div>col</div>
    <div>col 2</div>
    <ngn-treeitem label="SubItem B" collapsed="false">
      <div>B</div>
      <div>B</div>
      <ngn-treeitem label="SubItem C">
        <div>C</div>
        <div>C</div>
      </ngn-treeitem>
    </ngn-treeitem>
  </ngn-treeitem>
  <ngn-treeitem label="Item C" drag="false">
    <div>C2</div>
    <div>C2</div>
  </ngn-treeitem>
  <ngn-treeitem label="Item D" drag="false" drop="false">
    <div>test col</div>
    <div>test col 2</div>
  </ngn-treeitem>
  <ngn-treeitem>
    <label>Label A</label>
  </ngn-treeitem>
</ngn-tree>
```

### Attributes

drag drop collapsed label

### CSS Styles

