import { expect, test } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { AnyCircuitElement } from "circuit-json"

test("gltf circle soldermask margin test", async () => {
  const circuit: AnyCircuitElement[] = [
    {
      type: "pcb_board",
      pcb_board_id: "board_test",
      center: { x: 0, y: 0 },
      width: 20,
      height: 20,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    // Row 1: Fully Covered (Green Circle)
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_fully_covered",
      shape: "circle",
      x: 0,
      y: 6,
      radius: 1,
      layer: "top",
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "label_covered",
      pcb_component_id: "dummy_component",
      text: "COVERED",
      layer: "top",
      anchor_position: { x: 4, y: 6 },
      anchor_alignment: "center_left",
      font_size: 0.5,
      font: "tscircuit2024",
    },

    // Row 2: Positive Margin (Green Circle)
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_positive_margin",
      shape: "circle",
      x: 0,
      y: 2,
      radius: 1,
      layer: "top",
      soldermask_margin: 0.5,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "label_positive",
      pcb_component_id: "dummy_component",
      text: "POSITIVE",
      layer: "top",
      anchor_position: { x: 4, y: 2 },
      anchor_alignment: "center_left",
      font_size: 0.5,
      font: "tscircuit2024",
    },

    // Row 3: Negative Margin (Green Circle)
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_negative_margin",
      shape: "circle",
      x: 0,
      y: -2,
      radius: 1,
      layer: "top",
      soldermask_margin: -0.3,
      is_covered_with_solder_mask: true,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "label_negative",
      pcb_component_id: "dummy_component",
      text: "NEGATIVE",
      layer: "top",
      anchor_position: { x: 4, y: -2 },
      anchor_alignment: "center_left",
      font_size: 0.5,
      font: "tscircuit2024",
    },

    // Row 4: Default (Green Circle)
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad_default",
      shape: "circle",
      x: 0,
      y: -6,
      radius: 1,
      layer: "top",
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "label_default",
      pcb_component_id: "dummy_component",
      text: "DEFAULT",
      layer: "top",
      anchor_position: { x: 4, y: -6 },
      anchor_alignment: "center_left",
      font_size: 0.5,
      font: "tscircuit2024",
    },
    // Dummy component required for silkscreen
    {
      type: "pcb_component",
      pcb_component_id: "dummy_component",
      obstructs_within_bounds: false,
      center: { x: 0, y: 0 },
      width: 20,
      height: 20,
      rotation: 0,
      layer: "top",
      source_component_id: "dummy",
    },
  ]

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 1024,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Use a custom camera position to see the board clearly
  // Looking from negative Z ensures "Top" (Row 1, Z>0) is effectively "Farther away" (Top of screen)
  // relative to "Bottom" (Row 4, Z<0), correcting the "Upside Down" initialization.
  const cameraPosition = {
    camPos: [0, 30, -20] as const,
    lookAt: [0, 0, 0] as const,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glbResult as ArrayBuffer,
      cameraPosition,

    ),
  ).toMatchPngSnapshot(import.meta.path)
})
