// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.

const starId = "21:1941";
const starFrameId = "23:1954";


async function main() {
  const nodes = figma.currentPage.selection;
  if (nodes.length === 0) {
    figma.notify("No selection!");
    return;
  }
  if (nodes.some((e) => e.id === starId || e.id === starFrameId)) {
    figma.notify("Ye, can't select that star dude.");
    return;
  }

  const starNode = await figma.getNodeByIdAsync(starId);

  if (!starNode) {
    console.log("Dude!?? Star is gone or what?");
    figma.notify("Did you fucking delete star node??");
    return;
  }

  console.log("Here, I am!");
  console.log(starNode.type);

  if (starNode.type != "VECTOR") {
    console.log("I think we're in the wrong place.");
    return;
  }

  
  for (const node of nodes) {
    if (node.type === "FRAME") {
      ungroupAll(node);

      const kids = node.children;
      for (const kid of kids) {
        const c = starNode.clone();
        node.insertChild(0, c);
        // Center the clone inside the frame
        c.x = (node.width - c.width) / 2;
        c.y = (node.height - c.height) / 2;
        
        // Now intersect
        const result = figma.intersect([c, kid], node);
        if (result) {
          // Step 1: Copy fills
          if ("fills" in kid && kid.fills !== figma.mixed) {
            result.fills = kid.fills;
          }
          
          // Step 4: Copy opacity
          if ("opacity" in kid) {
            result.opacity = kid.opacity;
          }
          // Step 5: Copy blend mode if applicable
          if ("blendMode" in kid) {
            result.blendMode = kid.blendMode;
          }
        }
      }
    }
  }
}

function ungroupAll(frame: GroupNode | FrameNode) {
  const children = [...frame.children]; // Take a snapshot of the children array

  for (const child of children) {
    if (child.type === "GROUP" || child.type === "FRAME") {
      // Recursively ungroup the child
      ungroupAll(child);

      // Move all grandchildren to the root frame
      for (const grandchild of child.children) {
        frame.appendChild(grandchild);
      }
    }
  }
}

(async () => {
  await main();
  console.log("Finished");
  figma.closePlugin();
})();