/**
 * Extract the chosen Field and the list name from the query.
 * The query part of the workingObject will remain only with the SELECT statement (if found)
 * @param  {CamlSql~ParsedQuery} workingObject The working object to process
 */
function extractListAndFieldNameParts(workingObject) {
  var query = workingObject.query,
      fields = [],
      listName,
      t,
      i,
      m = query.match(/^SELECT\s(.*?)(?:\sFROM\s(.*?)|)(?:\s+((?:order|group|where).*)$|$)/i);

  if (m) {
    if (m.length == 4) {
      fields = parseFieldNames(m[1]);
      for (i=0; i < fields.length; i++) {

        if ((t = fields[i].match(/^(.*?)\.(.*?)\sas\s(.*?)$/i))) {
          workingObject.projectedFields.push({
            list : t[1],
            field : t[2],
            name : t[3]
          });
          fields[i] = formatFieldName(t[3]);
        } else if (fields[i].indexOf('.') !== -1) {
          throw "[camlsql] Projected fields in the format <list>.<field_name> must be followed with an AS <alias>";
        } 
      }
      workingObject.fields = fields;
      workingObject.listName = formatFieldName(m[2]);

      if (!workingObject.listName.match(/^[a-z\d_]+$/i)) {
        throw "[camlsql] Wrap list name in brackets if it contains special characters: [" + workingObject.listName + "]";
      }

      workingObject.query = m[3];
    } else {
      workingObject.query = "";
    }
  }
}

/**
 * Attempt to parse the list of field names into an array of strings
 * @param  {string}           The string from which to parse the field names
 * @return {Array.<string>}   An array of field names
 */
function parseFieldNames(fieldNameString) {
  var fields = [],
      t = fieldNameString.split(','),
      i;
  for (i=0; i < t.length; i++) {
    t[i] = formatFieldName(t[i]);
    fields.push(t[i]);
  }
  if (fields.length == 1 && fields[0] == '*') fields = [];
  return fields;
}
