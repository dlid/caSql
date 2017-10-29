/*!
 *
 * This will expose private methods publicly so tests can be run
 * 
 */


publicData.__testonly__ = publicData.__testonly__ || {};

publicData.__testonly__.padString = padString;
publicData.__testonly__.extractOrderByPart = extractOrderByPart;
publicData.__testonly__.extractListAndFieldNameParts = extractListAndFieldNameParts;
publicData.__testonly__.extractScopePart = extractScopePart;
publicData.__testonly__.extractLimitPart = extractLimitPart;
publicData.__testonly__.parseSqlQuery = parseSqlQuery;
publicData.__testonly__.whereParser = WhereParser;
//publicData.__testonly__.createNowParameter = createNowParameter;
publicData.__testonly__.createDateParameter = createDateParameter;
publicData.__testonly__.createDateTimeParameter = createDateTimeParameter;
publicData.__testonly__.createTodayParameter = createTodayParameter;
publicData.__testonly__.createGuidParameter = createGuidParameter;
publicData.__testonly__.createMultiChoiceParameter = createMultiChoiceParameter;
publicData.__testonly__.createChoiceParameter = createChoiceParameter;
publicData.__testonly__.createUrlParameter = createUrlParameter;
publicData.__testonly__.createUserParameter = createUserParameter;
publicData.__testonly__.encodeHTML = encodeHTML;
publicData.__testonly__.trim = trim;
publicData.__testonly__.formatFieldName = formatFieldName;
