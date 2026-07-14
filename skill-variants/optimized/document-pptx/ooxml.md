# OOXML Technical Reference for PowerPoint

Read this before editing .pptx files. Incorrect XML creates invalid files PowerPoint can't open.

## Schema Rules
- Element order in `<p:txBody>`: `<a:bodyPr>`, `<a:lstStyle>`, `<a:p>`
- Add `xml:space='preserve'` to `<a:t>` with leading/trailing spaces
- Escape unicode: `"` → `&#8220;`
- Add `dirty="0"` to `<a:rPr>` and `<a:endParaRPr>`
- Images: add to `ppt/media/`, reference in slide XML, update relationships

## Slide Structure
```xml
<p:sld>
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>...</p:nvGrpSpPr>
      <p:grpSpPr>...</p:grpSpPr>
      <!-- Shapes here -->
    </p:spTree>
  </p:cSld>
</p:sld>
```

### Text Shape
```xml
<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="2" name="Title"/>
    <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
    <p:nvPr><p:ph type="ctrTitle"/></p:nvPr>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="838200" y="365125"/><a:ext cx="7772400" cy="1470025"/></a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:bodyPr/><a:lstStyle/>
    <a:p><a:r><a:t>Title Text</a:t></a:r></a:p>
  </p:txBody>
</p:sp>
```

### Text Formatting
```xml
<a:r><a:rPr b="1"/><a:t>Bold</a:t></a:r>           <!-- bold -->
<a:r><a:rPr i="1"/><a:t>Italic</a:t></a:r>         <!-- italic -->
<a:r><a:rPr u="sng"/><a:t>Underline</a:t></a:r>    <!-- underline -->
<a:r><a:rPr lang="en-US" sz="1400" b="1" dirty="0">
  <a:solidFill><a:srgbClr val="FF0000"/></a:solidFill>
</a:rPr><a:t>Red bold 14pt</a:t></a:r>
```

### Lists
```xml
<a:p><a:pPr lvl="0"><a:buChar char="•"/></a:pPr>
  <a:r><a:t>Bullet item</a:t></a:r></a:p>
<a:p><a:pPr lvl="0"><a:buAutoNum type="arabicPeriod"/></a:pPr>
  <a:r><a:t>Numbered item</a:t></a:r></a:p>
```

### Placeholder Types
Title: `<p:ph type="ctrTitle"/>` or `<p:ph type="title"/>`
Subtitle: `<p:ph type="subTitle" idx="1"/>`
Body: `<p:ph type="body" idx="1"/>`

## File Updates When Adding Content

Update these files when adding slides/images:
- `[Content_Types].xml`: Override for new slides, Default for image types
- `ppt/_rels/presentation.xml.rels`: Relationship for new slides
- `ppt/presentation.xml`: `<p:sldId>` in `<p:sldIdLst>` (order = slide order)
- `ppt/slides/_rels/slideN.xml.rels`: References to images, layouts
- `docProps/app.xml`: Slide count (if present)

## Slide Operations

**Add**: Create slide XML → update Content_Types → add relationship → add to sldIdLst → create _rels file
**Duplicate**: Copy XML + update all IDs + follow Add steps + clean notes/media refs
**Reorder**: Change `<p:sldId>` order in `<p:sldIdLst>` (keep IDs unchanged)
**Delete**: Remove from sldIdLst → remove relationship → remove Content_Types entry → delete files → clean up media

Don't renumber remaining slides after deletion.

## Validation Checklist
- Clean unused resources (media, fonts, notes)
- Fix Content_Types.xml for ALL slides/layouts/themes
- Remove broken references in `_rels` files
- Watch for: duplicate notes refs after duplication, missing media, font embedding refs without fonts
