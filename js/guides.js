const B_GUIDES = "pixmacr-guides";
setUpLocalStorageBucket(B_GUIDES, "0");
execBucket(B_GUIDES, "0", () => {
  guide.checked = false;
});

const B_QGUIDES = "pixmacr-qguides";
setUpLocalStorageBucket(B_QGUIDES, "0");
execBucket(B_QGUIDES, "0", () => {
  qguide.checked = false;
});

function refreshGuides() {
  for (let y = 0; y < cells2d.length; y++) {
    for (let x = 0; x < cells2d[0].length; x++) {
      cells2d[y][x].style.border = guide.checked
        ? "1px solid var(--primary)"
        : "0px solid var(--primary)";
      if (guide.checked) cells2d[y][x].style.borderWidth = "1px 0 0 1px";
    }
  }
  operateOverLine(0, (cell) => {
    cell.style.borderTopWidth = "0px";
  });
  operateOverLine(
    0,
    (cell) => {
      cell.style.borderLeftWidth = "0px";
    },
    "col"
  );
  if (qguide.checked) {
    let verticalBorderStyle = 'solid', horizontalBorderStyle = 'solid'
    if (mirroring.checked) {
        if(mirroringType.value == 'both' || mirroringType.value == 'vertical') verticalBorderStyle = 'dotted'
        if(mirroringType.value == 'both' || mirroringType.value == 'horizontal') horizontalBorderStyle = 'dotted'
    }
    if (rows % 2 == 0) {
      operateOverLine(rows / 2, (cell) => {
        cell.style.borderTop = `1px ${horizontalBorderStyle} green`;
      });
    } else {
      operateOverLine(Math.floor(rows / 2) + 1, (cell) => {
        cell.style.borderTop = `1px ${horizontalBorderStyle} green`;
      });
      operateOverLine(Math.floor(rows / 2), (cell) => {
        cell.style.borderTop = `1px ${horizontalBorderStyle} green`;
      });
    }
    if (cols % 2 == 0) {
      operateOverLine(
        cols / 2,
        (cell) => {
          cell.style.borderLeft = `1px ${verticalBorderStyle} red`;
        },
        "col"
      );
    } else {
      operateOverLine(
        Math.floor(cols / 2) + 1,
        (cell) => {
          cell.style.borderLeft = `1px ${verticalBorderStyle} red`;
        },
        "col"
      );
      operateOverLine(
        Math.floor(cols / 2),
        (cell) => {
          cell.style.borderLeft = `1px ${verticalBorderStyle} red`;
        },
        "col"
      );
    }
  }
}

function operateOverLine(i, oop, mode = "row") {
  if (mode == "row") {
    for (let x = 0; x < cells2d[i].length; x++) oop(cells2d[i][x]);
  } else {
    for (let y = 0; y < cells2d.length; y++) oop(cells2d[y][i]);
  }
}

guide.oninput = () => {
  refreshGuides();
  setBucketVal(B_GUIDES, guide.checked ? "1" : "0");
};

qguide.oninput = () => {
  refreshGuides();
  setBucketVal(B_QGUIDES, qguide.checked ? "1" : "0");
};

mirroring.onchange = ()=> {
    if(qguide.checked) refreshGuides()
}
id('mirroring-type').onchange = ()=>{
    if(qguide.checked) refreshGuides()
}