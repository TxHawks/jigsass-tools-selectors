'use strict';

/* global assert, fs, path, Sassaby,  */

describe('jigsass-tools-selectors', () => {
  const file = path.resolve(__dirname, 'helpers/importer.scss');
  const sassaby = new Sassaby(file);
  const sassabyForModifiers = new Sassaby(file, {
    variables: {
      'jigsass-breakpoints': '(lengths:(default: 0, small: 320px), features: (landscape: "(orientation: landscape)"))'
    }
  });

  describe('_map2style.scss', () => {
    describe('jigsass-map2style [Mixin]', () => {
      it('Creates styles from a map', () => {
        sassaby.includedMixin('jigsass-map2styles')
          .calledWithArgs('$m2s-test1')
          .equals('border-left: 1rem solid #ccc; transform:translateX(50%); padding: 0 2rem 0 3rem');
      });

      it('Coverts direction correctly', () => {
        const sassaby = new Sassaby(file, {
          variables: {
           'jigsass-direction': 'rtl'
          }
        });
        sassaby.includedMixin('jigsass-map2styles')
          .calledWithArgs('$m2s-test1')
          .equals('border-right: 1rem solid #ccc; transform:translateX(-50%); padding: 0 3rem 0 2rem');
      });

      it('Creates nested selectors from a map', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '.test {' +
              '@include jigsass-map2styles($m2s-test2)' +
            '}'
          )
          .equals('.test > .nested {border-left: 1rem solid #ccc}');
      });
    });
  });

  describe('_silent.scss', () => {
    describe('jigsass-if-not-silent [Mixin]', () => {
      it('Suppresses CSS output when `$jigsass-silent` is true', () => {
        const sassaby = new Sassaby(file, {
          variables: {
            'jigsass-silent': true
          }
        });

        sassaby.standaloneMixin('jigsass-if-not-silent')
          .calledWithBlock('test {key: value;}')
          .equals('');
      });

      it('Generates CSS output when `$jigsass-silent` is false', () => {
        sassaby.standaloneMixin('jigsass-if-not-silent')
          .calledWithBlock('test {key: value;}')
          .equals('test{key:value}');
      });
    });
  });

  describe('_namepace.scss', () => {
    describe('jigsass-get-namespace [Function]', () => {
      it('Parses namespace correctly when it is defined', () => {
        const sassaby = new Sassaby(file, {
          variables: {
            'jigsass-namespace': 'jig'
          }
        });

        sassaby.func('jigsass-get-namespace')
          .calledWithArgs('')
          .equals('"jig-"');
      });

      it('Returns an empty string when namespace is not defined', () => {
        sassaby.func('jigsass-get-namespace')
          .calledWithArgs('')
          .equals('""');
      });
    });
  });

  describe('_helpers.scss', () => {
    describe('_jigsass-gen-class-name [Function]', () => {
      it('Returns the correct class name with only a name', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('test-name')
          .equals('test-name');
      });

      it('Returns the correct class name with a namespace', () => {
        const sassaby = new Sassaby(file, {
          variables: {
            'jigsass-namespace': 'jig'
          }
        });
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('test-name')
          .equals('jig-test-name');
      });

      it('Returns the correct class name with `$from` arg', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('$name: test-name, $from: s')
          .equals('test-name--from-s');
      });

      it('Returns the correct class name with `$until` arg', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('$name: test-name, $until: s')
          .equals('test-name--until-s');
      });

      it('Returns the correct class name with `$misc` arg', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('$name: test-name, $misc: landscape')
          .equals('test-name--when-landscape');
      });

      it('Returns the correct class name with `$modifier` arg', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs('$name: test-name, $modifier: mod')
          .equals('test-name--mod');
      });

      it('Returns the correct class name with all args', () => {
        sassaby.func('_jigsass-gen-class-name')
          .calledWithArgs(
            '$name: test-name',
            '$from: s',
            '$until: l',
            '$misc: landscape',
            '$modifier: mod'
          )
          .equals('test-name--mod--from-s--until-l--when-landscape');
      });

      describe('errors', () => {
        it('Throws when `$from` arg is not a defined named length breakpoint', () => {
          assert.throws(
            () => {
              // Also raises a warning from `jigsass-mq-get-breakpoint-width`
              sassaby.func('_jigsass-gen-class-name')
              .calledWithArgs('$name: test-name, $from: bogous')
            },
            /_jigsass-gen-class-name: bogous is not defined in the lengths breakpoints map \(from test-name\)/
          );
        });

        it('Throws when `$until` arg is not a defined named length breakpoint', () => {
          assert.throws(
            () => {
              // Also raises a warning from `jigsass-mq-get-breakpoint-width`
              sassaby.func('_jigsass-gen-class-name')
              .calledWithArgs('$name: test-name, $until: bogous')
            },
            /_jigsass-gen-class-name: bogous is not defined in the lengths breakpoints map \(from test-name\)/
          );
        });

        it('Throws when `$until` arg is not a defined named misc breakpoint', () => {
          assert.throws(
            () => {
              sassaby.func('_jigsass-gen-class-name')
              .calledWithArgs('$name: test-name, $misc: bogous')
            },
            /_jigsass-gen-class-name: bogous is not defined in the misc features breakpoints map \(from test-name\)/
          );
        });
      })
    });

    describe('_jigsass-class-was-called [Function]', () => {
      const sassaby = new Sassaby(file, {
        variables: {
          '_jigsass-selectors': '(' +
            'test-class: (' +
              'no-breakpoint: (' +
                'no-modifier: false,' +
                'mod: silent,' +
                'mod2: true,' +
               '),' +
              'from-l-when-landscape: (' +
                'no-modifier: silent,' +
                'mod: true,' +
                'mod2: false,' +
               '),' +
            ')' +
          ');'
        }
      });

      describe('No breakpoint', () => {
        it('Returns `false` when a `no-breakpoint`, `no-modifier` ' +
           'variant wasn\'t called before', () =>
        {
          sassaby.func('_jigsass-class-was-included')
            .calledWithArgs('test-class, false, false, false, false')
            .isFalse();
        });

        it('Returns `true` when a `no-breakpoint`, `mod2` variant was called before', () => {
          sassaby.func('_jigsass-class-was-included')
            .calledWithArgs('test-class, false, false, false, mod2')
            .isTrue();
        });

        it('Returns `silent` when a `no-breakpoint`, `mod` ' +
           'variant was called in silent mode', () =>
        {
          sassaby.func('_jigsass-class-was-included')
            .calledWithArgs('test-class, false, false, false, mod')
            .equals('silent');
        });
      })

      describe('With breakpoints', () => {
        it('Returns `silent` when a `from-l-when-landscape`, `no-modifier` ' +
           'variant wasn called in silent mode', () =>
        {
          sassaby.func('_jigsass-class-was-included')
            .calledWithArgs('test-class, l, false, landscape, false')
            .equals('silent');
        });

        it('Returns `true` when a `from-l-when-landscape`, `mod` ' +
           'variant was called before', () =>
        {
          sassaby.func('_jigsass-class-was-included')
          .calledWithArgs('test-class, l, false, landscape, mod')
          .isTrue();
        });

        it('Returns `false` when a `from-l-when-landscape`, `mod2` ' +
           'variant was\'t called before', () =>
        {
          sassaby.func('_jigsass-class-was-included')
            .calledWithArgs('test-class, l, false, landscape, mod2')
            .isFalse();
        });
      })
    });

    describe('_jigsass-generate-selector-map [Function]', () => {
      it('Creates a map with keys in the correct order', () => {
        sassaby.func('inspect')
          .calledWithArgs('_jigsass-generate-selector-map(test-class)')
          .equals(
            '(test-class:(no-breakpoint:(no-modifier:false),from-s:(no-modifier:false),from-m:(no-modifier:false),from-l:(no-modifier:false),until-s:(no-modifier:false),until-m:(no-modifier:false),until-l:(no-modifier:false),from-s-until-m:(no-modifier:false),from-s-until-l:(no-modifier:false),from-m-until-l:(no-modifier:false),when-landscape:(no-modifier:false),when-portrait:(no-modifier:false),from-s-when-landscape:(no-modifier:false),from-s-when-portrait:(no-modifier:false),from-m-when-landscape:(no-modifier:false),from-m-when-portrait:(no-modifier:false),from-l-when-landscape:(no-modifier:false),from-l-when-portrait:(no-modifier:false),until-s-when-landscape:(no-modifier:false),until-s-when-portrait:(no-modifier:false),until-m-when-landscape:(no-modifier:false),until-m-when-portrait:(no-modifier:false),until-l-when-landscape:(no-modifier:false),until-l-when-portrait:(no-modifier:false),from-s-until-m-when-landscape:(no-modifier:false),from-s-until-m-when-portrait:(no-modifier:false),from-s-until-l-when-landscape:(no-modifier:false),from-s-until-l-when-portrait:(no-modifier:false),from-m-until-l-when-landscape:(no-modifier:false),from-m-until-l-when-portrait:(no-modifier:false)))'
          );
      })
    });
  });

  describe('_object.scss', () => {
    describe('jigsass-define-object [Mixin]', () => {
      it('generates all placeholder selectors inside correct media queries', () => {
        sassaby.standaloneMixin('jigsass-define-object')
          .calledWithBlockAndArgs(
            '@include jigsass-classname {' +
              '$_selector: str-slice(inspect(&), 2);' +

              '@at-root {' +
                '.#{$_selector} {k:v;}' +
              '}' +
            '}',
            'test-obj'
          )
          .equals(
            '.test-obj{k:v}' +
            '@media(min-width:20em){.test-obj--from-s{k:v}}' +
            '@media(min-width:45em){.test-obj--from-m{k:v}}' +
            '@media(min-width:64em){.test-obj--from-l{k:v}}' +
            '@media(max-width:19.99em){.test-obj--until-s{k:v}}' +
            '@media(max-width:44.99em){.test-obj--until-m{k:v}}' +
            '@media(max-width:63.99em){.test-obj--until-l{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em){.test-obj--from-s--until-m{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em){.test-obj--from-s--until-l{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em){.test-obj--from-m--until-l{k:v}}' +
            '@media(orientation:landscape){.test-obj--when-landscape{k:v}}' +
            '@media(orientation:portrait){.test-obj--when-portrait{k:v}}' +
            '@media(min-width:20em) and (orientation:landscape){.test-obj--from-s--when-landscape{k:v}}' +
            '@media(min-width:20em) and (orientation:portrait){.test-obj--from-s--when-portrait{k:v}}' +
            '@media(min-width:45em) and (orientation:landscape){.test-obj--from-m--when-landscape{k:v}}' +
            '@media(min-width:45em) and (orientation:portrait){.test-obj--from-m--when-portrait{k:v}}' +
            '@media(min-width:64em) and (orientation:landscape){.test-obj--from-l--when-landscape{k:v}}' +
            '@media(min-width:64em) and (orientation:portrait){.test-obj--from-l--when-portrait{k:v}}' +
            '@media(max-width:19.99em) and (orientation:landscape){.test-obj--until-s--when-landscape{k:v}}' +
            '@media(max-width:19.99em) and (orientation:portrait){.test-obj--until-s--when-portrait{k:v}}' +
            '@media(max-width:44.99em) and (orientation:landscape){.test-obj--until-m--when-landscape{k:v}}' +
            '@media(max-width:44.99em) and (orientation:portrait){.test-obj--until-m--when-portrait{k:v}}' +
            '@media(max-width:63.99em) and (orientation:landscape){.test-obj--until-l--when-landscape{k:v}}' +
            '@media(max-width:63.99em) and (orientation:portrait){.test-obj--until-l--when-portrait{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em) and (orientation:landscape){.test-obj--from-s--until-m--when-landscape{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em) and (orientation:portrait){.test-obj--from-s--until-m--when-portrait{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em) and (orientation:landscape){.test-obj--from-s--until-l--when-landscape{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em) and (orientation:portrait){.test-obj--from-s--until-l--when-portrait{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em) and (orientation:landscape){.test-obj--from-m--until-l--when-landscape{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em) and (orientation:portrait){.test-obj--from-m--until-l--when-portrait{k:v}}'
          );
      });

      it('Generates modifier', () => {
        sassaby.standaloneMixin('jigsass-define-object')
          .calledWithBlockAndArgs(
            '@include jigsass-classname($modifier: bar) {' +
              '$_selector: str-slice(inspect(&), 2);' +

              '@at-root {' +
                '.#{$_selector} {k:v;}' +
              '}' +
            '}',
            'foo'
          )
          .equals(
            '.foo--bar{k:v}' +
            '@media(min-width:20em){.foo--bar--from-s{k:v}}' +
            '@media(min-width:45em){.foo--bar--from-m{k:v}}' +
            '@media(min-width:64em){.foo--bar--from-l{k:v}}' +
            '@media(max-width:19.99em){.foo--bar--until-s{k:v}}' +
            '@media(max-width:44.99em){.foo--bar--until-m{k:v}}' +
            '@media(max-width:63.99em){.foo--bar--until-l{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em){.foo--bar--from-s--until-m{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em){.foo--bar--from-s--until-l{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em){.foo--bar--from-m--until-l{k:v}}' +
            '@media(orientation:landscape){.foo--bar--when-landscape{k:v}}' +
            '@media(orientation:portrait){.foo--bar--when-portrait{k:v}}' +
            '@media(min-width:20em) and (orientation:landscape){.foo--bar--from-s--when-landscape{k:v}}' +
            '@media(min-width:20em) and (orientation:portrait){.foo--bar--from-s--when-portrait{k:v}}' +
            '@media(min-width:45em) and (orientation:landscape){.foo--bar--from-m--when-landscape{k:v}}' +
            '@media(min-width:45em) and (orientation:portrait){.foo--bar--from-m--when-portrait{k:v}}' +
            '@media(min-width:64em) and (orientation:landscape){.foo--bar--from-l--when-landscape{k:v}}' +
            '@media(min-width:64em) and (orientation:portrait){.foo--bar--from-l--when-portrait{k:v}}' +
            '@media(max-width:19.99em) and (orientation:landscape){.foo--bar--until-s--when-landscape{k:v}}' +
            '@media(max-width:19.99em) and (orientation:portrait){.foo--bar--until-s--when-portrait{k:v}}' +
            '@media(max-width:44.99em) and (orientation:landscape){.foo--bar--until-m--when-landscape{k:v}}' +
            '@media(max-width:44.99em) and (orientation:portrait){.foo--bar--until-m--when-portrait{k:v}}' +
            '@media(max-width:63.99em) and (orientation:landscape){.foo--bar--until-l--when-landscape{k:v}}' +
            '@media(max-width:63.99em) and (orientation:portrait){.foo--bar--until-l--when-portrait{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em) and (orientation:landscape){.foo--bar--from-s--until-m--when-landscape{k:v}}' +
            '@media(min-width:20em) and (max-width:44.99em) and (orientation:portrait){.foo--bar--from-s--until-m--when-portrait{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em) and (orientation:landscape){.foo--bar--from-s--until-l--when-landscape{k:v}}' +
            '@media(min-width:20em) and (max-width:63.99em) and (orientation:portrait){.foo--bar--from-s--until-l--when-portrait{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em) and (orientation:landscape){.foo--bar--from-m--until-l--when-landscape{k:v}}' +
            '@media(min-width:45em) and (max-width:63.99em) and (orientation:portrait){.foo--bar--from-m--until-l--when-portrait{k:v}}'
          );
      });

      it('Generates base class and modifier in correct order', () => {
        sassaby.standaloneMixin('jigsass-define-object')
          .calledWithBlockAndArgs(
            '@include jigsass-classname() {' +
              '$_selector: str-slice(inspect(&), 2);' +
              '@at-root {' +
                '.#{$_selector} {k:v;}' +
              '}' +
            '}' +
            '@include jigsass-classname($modifier: bar) {' +
              '$_selector: str-slice(inspect(&), 2);' +
              '@at-root {' +
                '.#{$_selector} {k:v;}' +
              '}' +
            '}',
            'foo'
          )
          .equals(
            '.foo{k:v}' +
						'.foo--bar{k:v}' +
						'@media(min-width:20em){.foo--from-s{k:v}.foo--bar--from-s{k:v}}' +
						'@media(min-width:45em){.foo--from-m{k:v}.foo--bar--from-m{k:v}}' +
						'@media(min-width:64em){.foo--from-l{k:v}.foo--bar--from-l{k:v}}' +
						'@media(max-width:19.99em){.foo--until-s{k:v}.foo--bar--until-s{k:v}}' +
						'@media(max-width:44.99em){.foo--until-m{k:v}.foo--bar--until-m{k:v}}' +
						'@media(max-width:63.99em){.foo--until-l{k:v}.foo--bar--until-l{k:v}}' +
						'@media(min-width:20em) and (max-width:44.99em){.foo--from-s--until-m{k:v}.foo--bar--from-s--until-m{k:v}}' +
						'@media(min-width:20em) and (max-width:63.99em){.foo--from-s--until-l{k:v}.foo--bar--from-s--until-l{k:v}}' +
						'@media(min-width:45em) and (max-width:63.99em){.foo--from-m--until-l{k:v}.foo--bar--from-m--until-l{k:v}}' +
						'@media(orientation:landscape){.foo--when-landscape{k:v}.foo--bar--when-landscape{k:v}}' +
						'@media(orientation:portrait){.foo--when-portrait{k:v}.foo--bar--when-portrait{k:v}}' +
						'@media(min-width:20em) and (orientation:landscape){.foo--from-s--when-landscape{k:v}.foo--bar--from-s--when-landscape{k:v}}' +
						'@media(min-width:20em) and (orientation:portrait){.foo--from-s--when-portrait{k:v}.foo--bar--from-s--when-portrait{k:v}}' +
						'@media(min-width:45em) and (orientation:landscape){.foo--from-m--when-landscape{k:v}.foo--bar--from-m--when-landscape{k:v}}' +
						'@media(min-width:45em) and (orientation:portrait){.foo--from-m--when-portrait{k:v}.foo--bar--from-m--when-portrait{k:v}}' +
						'@media(min-width:64em) and (orientation:landscape){.foo--from-l--when-landscape{k:v}.foo--bar--from-l--when-landscape{k:v}}' +
						'@media(min-width:64em) and (orientation:portrait){.foo--from-l--when-portrait{k:v}.foo--bar--from-l--when-portrait{k:v}}' +
						'@media(max-width:19.99em) and (orientation:landscape){.foo--until-s--when-landscape{k:v}.foo--bar--until-s--when-landscape{k:v}}' +
						'@media(max-width:19.99em) and (orientation:portrait){.foo--until-s--when-portrait{k:v}.foo--bar--until-s--when-portrait{k:v}}' +
						'@media(max-width:44.99em) and (orientation:landscape){.foo--until-m--when-landscape{k:v}.foo--bar--until-m--when-landscape{k:v}}' +
						'@media(max-width:44.99em) and (orientation:portrait){.foo--until-m--when-portrait{k:v}.foo--bar--until-m--when-portrait{k:v}}' +
						'@media(max-width:63.99em) and (orientation:landscape){.foo--until-l--when-landscape{k:v}.foo--bar--until-l--when-landscape{k:v}}' +
						'@media(max-width:63.99em) and (orientation:portrait){.foo--until-l--when-portrait{k:v}.foo--bar--until-l--when-portrait{k:v}}' +
						'@media(min-width:20em) and (max-width:44.99em) and (orientation:landscape){.foo--from-s--until-m--when-landscape{k:v}.foo--bar--from-s--until-m--when-landscape{k:v}}' +
						'@media(min-width:20em) and (max-width:44.99em) and (orientation:portrait){.foo--from-s--until-m--when-portrait{k:v}.foo--bar--from-s--until-m--when-portrait{k:v}}' +
						'@media(min-width:20em) and (max-width:63.99em) and (orientation:landscape){.foo--from-s--until-l--when-landscape{k:v}.foo--bar--from-s--until-l--when-landscape{k:v}}' +
						'@media(min-width:20em) and (max-width:63.99em) and (orientation:portrait){.foo--from-s--until-l--when-portrait{k:v}.foo--bar--from-s--until-l--when-portrait{k:v}}' +
						'@media(min-width:45em) and (max-width:63.99em) and (orientation:landscape){.foo--from-m--until-l--when-landscape{k:v}.foo--bar--from-m--until-l--when-landscape{k:v}}' +
						'@media(min-width:45em) and (max-width:63.99em) and (orientation:portrait){.foo--from-m--until-l--when-portrait{k:v}.foo--bar--from-m--until-l--when-portrait{k:v}}'
          );
      });

      it('Throws when trying to modifier is `no-modifier`', () => {
        assert.throws(
          () => {
            sassaby.standaloneMixin('jigsass-define-object')
              .calledWithBlockAndArgs(
                '@include jigsass-classname($modifier: no-modifier) {' +
                  '$_selector: str-slice(inspect(&), 2);' +

                  '@at-root {' +
                    '.#{$_selector} {k:v;}' +
                  '}' +
                '}',
                'foo'
              );
          },
          /jigsass-classname: A jigsass class modifier cannot be called `no-modifier` \(from foo\)/
        );
      });
    });

    describe('jigsass-object [Mixin]', () => {
      it('Creates selector', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(foo) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(foo)'
          )
          .createsSelector('.foo');
      });

      it('Handles namespacing correctly', ()=> {
        const sassaby = new Sassaby(file, {
          variables: {
            'jigsass-namespace': 'jig'
          }
        })

        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(foo) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(foo)'
          )
          .createsSelector('.jig-foo');
      });

      it('Creates selector with modifier', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(foo) {' +
              '@include jigsass-classname($modifier: bar) {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(foo, $modifier: bar)'
          )
          .createsSelector('.foo--bar');
      });

      it('Creates selector with min-width media-query', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(name) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(name, $from: s)'
          )
          .equals('@media(min-width:20em){.name--from-s{k:v}}');
      });

      it('Creates selector with max-width media-query', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(name) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(name, $until: s)'
          )
          .equals('@media(max-width:19.99em){.name--until-s{k:v}}');
      });

      it('Creates selector with misc media-query', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(name) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(name, $misc: landscape)'
          )
          .equals('@media(orientation:landscape){.name--when-landscape{k:v}}');
      });

      it('Creates selector with all media-queries', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(name) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(name, $from: s, $until: l, $misc: landscape)'
          )
          .equals('@media(min-width: 20em) and (max-width: 63.99em) and (orientation:landscape){.name--from-s--until-l--when-landscape{k:v}}');
      });

      it('Creates selector with all media-queries and modifier', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(name) {' +
              '@include jigsass-classname($modifier: mod) {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(name, $from: s, $until: l, $misc: landscape, $modifier: mod)'
          )
          .equals('@media(min-width: 20em) and (max-width: 63.99em) and (orientation:landscape){.name--mod--from-s--until-l--when-landscape{k:v}}');
      });

      it('Creates selector where it was defined', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(defined-before) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '.after{ kk:vv }' +
            '@include jigsass-object(defined-before)'
          )
          .equals('.defined-before{k:v}.after{kk:vv}');
      });

      it('Does not generate output for undefined objects', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-object(defined) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(undefined)'
          )
          .doesNotCreateSelector('.undefined');
      });

      it('Does not generate output when called in silent mode', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlockAndArgs(
            '@include jigsass-define-object(foo) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-object(foo);',
            true
          )
          .equals('');
      });

      it('Does not generate output if it was called in silent mode at some point', ()=> {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlockAndArgs(
            '@include jigsass-define-object(foo) {' +
              '@include jigsass-classname {' +
                'k: v;' +
              '}' +
            '}' +
            '@include jigsass-mute;' +
            '@include jigsass-object(foo);' +
            '@include jigsass-unmute;' +
            '@include jigsass-object(foo);'
          )
          .equals('');
      });
    });
  });

  describe('_util.scss', () => {
    describe('jigsass-util [Mixin]', () => {
      it('Adds a key in default breakpoint with no modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util($name: test-util);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, no-breakpoint, no-modifier' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-default-bp:true}');
      });

      it('Adds a key in default breakpoint with modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util($name: test-util, $modifier: mod);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-modifier-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, no-breakpoint, mod' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-modifier-default-bp:true}');
      });

      it('Adds a key with min-width condition without modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util($name: test-util, $from: s);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-from-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, from-s, no-modifier' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-from-bp:true}');
      });

      it('Adds a key with max-width condition without modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util($name: test-util, $until: l);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, until-l, no-modifier' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-default-bp:true}');
      });

      it('Adds a key with misc condition without modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util($name: test-util, $misc: landscape);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, when-landscape, no-modifier' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-default-bp:true}');
      });

      it('Adds a key with all conditions without modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, s, l, landscape);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, from-s-until-l-when-landscape, no-modifier' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-default-bp:true}');
      });

      it('Adds a key with all conditions with modifier', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, s, l, landscape, mod);' +
            'test {' +
              'is-map: jig-var-type-is(map, $_jigsass-selectors);' +
              'sets-name-key-default-bp: jig-map-key-equals(' +
                'true, $_jigsass-selectors, test-util, from-s-until-l-when-landscape, mod' +
              ');' +
            '}'
          )
          .equals('test{is-map:true;sets-name-key-default-bp:true}');
      });

      it('Does not overwrite other breakpoints/modifiers in same util', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, s, l, $modifier: mod);' +
            '@include jigsass-util(test-util, default);' +
            '@include jigsass-util(test-util, s, $modifier: mod);' +
            '@include jigsass-util(test-util, false, m);' +
            'test {' +
              'selectors-map: inspect($_jigsass-selectors);' +
            '}'
          )
          .equals(
            'test{' +
							'selectors-map:(' +
								'test-util:(' +
									'no-breakpoint:(no-modifier:true),' +
									'from-s:(no-modifier:false,mod:true),' +
									'from-m:(no-modifier:false),' +
									'from-l:(no-modifier:false),' +
									'until-s:(no-modifier:false),' +
									'until-m:(no-modifier:true),' +
									'until-l:(no-modifier:false),' +
									'from-s-until-m:(no-modifier:false),' +
									'from-s-until-l:(no-modifier:false,mod:true),' +
									'from-m-until-l:(no-modifier:false),' +
									'when-landscape:(no-modifier:false),' +
									'when-portrait:(no-modifier:false),' +
									'from-s-when-landscape:(no-modifier:false),' +
									'from-s-when-portrait:(no-modifier:false),' +
									'from-m-when-landscape:(no-modifier:false),' +
									'from-m-when-portrait:(no-modifier:false),' +
									'from-l-when-landscape:(no-modifier:false),' +
									'from-l-when-portrait:(no-modifier:false),' +
									'until-s-when-landscape:(no-modifier:false),' +
									'until-s-when-portrait:(no-modifier:false),' +
									'until-m-when-landscape:(no-modifier:false),' +
									'until-m-when-portrait:(no-modifier:false),' +
									'until-l-when-landscape:(no-modifier:false),' +
									'until-l-when-portrait:(no-modifier:false),' +
									'from-s-until-m-when-landscape:(no-modifier:false),' +
									'from-s-until-m-when-portrait:(no-modifier:false),' +
									'from-s-until-l-when-landscape:(no-modifier:false),' +
									'from-s-until-l-when-portrait:(no-modifier:false),' +
									'from-m-until-l-when-landscape:(no-modifier:false),' +
									'from-m-until-l-when-portrait:(no-modifier:false)' +
								')' +
							')' +
						'}'
          );
      });

      it('Handles silent mode correctly', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util-silent, s, l, $modifier: mod);' +
            '@include jigsass-mute();' +
            '@include jigsass-util(test-util-silent, default);' +
            '@include jigsass-util(test-util-silent, s, l, $modifier: mod);' +
            '@include jigsass-unmute();' +
            '@include jigsass-util(test-util-silent, default);' +
            '@include jigsass-util(test-util-silent, s, $modifier: mod);' +
            '@include jigsass-util(test-util-silent, false, m);' +
            'test {' +
              'selectors-map: inspect($_jigsass-selectors);' +
            '}'
          )
          .equals(
						'test{' +
							'selectors-map:(' +
								'test-util-silent:(' +
									'no-breakpoint:(no-modifier:silent),' +
									'from-s:(no-modifier:false,mod:true),' +
									'from-m:(no-modifier:false),' +
									'from-l:(no-modifier:false),' +
									'until-s:(no-modifier:false),' +
									'until-m:(no-modifier:true),' +
									'until-l:(no-modifier:false),' +
									'from-s-until-m:(no-modifier:false),' +
									'from-s-until-l:(no-modifier:false,mod:true),' +
									'from-m-until-l:(no-modifier:false),' +
									'when-landscape:(no-modifier:false),' +
									'when-portrait:(no-modifier:false),' +
									'from-s-when-landscape:(no-modifier:false),' +
									'from-s-when-portrait:(no-modifier:false),' +
									'from-m-when-landscape:(no-modifier:false),' +
									'from-m-when-portrait:(no-modifier:false),' +
									'from-l-when-landscape:(no-modifier:false),' +
									'from-l-when-portrait:(no-modifier:false),' +
									'until-s-when-landscape:(no-modifier:false),' +
									'until-s-when-portrait:(no-modifier:false),' +
									'until-m-when-landscape:(no-modifier:false),' +
									'until-m-when-portrait:(no-modifier:false),' +
									'until-l-when-landscape:(no-modifier:false),' +
									'until-l-when-portrait:(no-modifier:false),' +
									'from-s-until-m-when-landscape:(no-modifier:false),' +
									'from-s-until-m-when-portrait:(no-modifier:false),' +
									'from-s-until-l-when-landscape:(no-modifier:false),' +
									'from-s-until-l-when-portrait:(no-modifier:false),' +
									'from-m-until-l-when-landscape:(no-modifier:false),' +
									'from-m-until-l-when-portrait:(no-modifier:false)' +
								')' +
							')' +
						'}'
					);
      });
    });

    describe('jigsass-define-util [Mixin]', () => {
      it('Creates defined util that was included with default breakpoint (implicit)', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util);' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('.test-util{margin-top: 6px}');
      });

      it('Creates defined util that was included with default breakpoint (explicit)', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, default);' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('.test-util{margin-top: 6px}');
      });

      it('Creates defined util that was included width min-width breakpoint', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, s);' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('@media(min-width:20em){.test-util--from-s{margin-top:6px}}');
      });

      it('Creates defined util that was included with max-width breakpoint', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, $until: m);' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('@media(max-width:44.99em){.test-util--until-m{margin-top:6px}}');
      });

      it('Creates defined util that was included with misc feature breakpoint', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, $misc: landscape)' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('@media(orientation:landscape){.test-util--when-landscape{margin-top:6px}}');
      });

      it('Creates defined util that was included with all breakpoint types', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-util(test-util, $from: s, $until: l, $misc: landscape)' +
            '@include jigsass-define-util(test-util) {' +
              'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
            '}'
          )
          .equals('@media(min-width: 20em) and (max-width: 63.99em) and (orientation:landscape){' +
                  '.test-util--from-s-until-l-when-landscape{margin-top:6px}}'
          );
      });

      describe('Modifier', () => {
        it('Creates defined util that was included with modifier and default breakpoint', () => {
          sassaby.standaloneMixin('test-silent')
            .calledWithBlock(
              '@include jigsass-util(test-util, $modifier: 6);' +
              '@include jigsass-define-util(test-util) {' +
                'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
              '}'
            )
            .equals('.test-util--6{margin-top: 36px}');
        });
      });

      describe('Cascade order', () => {
        it('Creates defined util that was included max-width and min-width breakpoints ' +
           'in correct order', () =>
        {
          sassaby.standaloneMixin('test-silent')
            .calledWithBlock(
              '@include jigsass-util(test-util, $until: l)' +
              '@include jigsass-util(test-util, $from: s)' +
              '@include jigsass-define-util(test-util) {' +
                'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
              '}'
            )
            .equals(
              '@media(min-width:20em){.test-util--from-s{margin-top:6px}}' +
              '@media(max-width: 63.99em){.test-util--until-l{margin-top:6px}}'
            );
        });

        it('Creates defined util that was included max-width and min-width breakpoints ' +
           'and a modifier in correct order', () =>
        {
          sassaby.standaloneMixin('test-silent')
            .calledWithBlock(
              '@include jigsass-util(test-util, $until: l)' +
              '@include jigsass-util(test-util, $from: s, $modifier: 6)' +
              '@include jigsass-util(test-util, $from: s)' +
              '@include jigsass-define-util(test-util) {' +
                'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
              '}'
            )
            .equals(
              '@media(min-width:20em){.test-util--from-s{margin-top:6px}}' +
              '@media(min-width:20em){.test-util--6--from-s{margin-top:36px}}' +
              '@media(max-width: 63.99em){.test-util--until-l{margin-top:6px}}'
            );
        });

        it('Creates defined util that was included misc and min-width breakpoints ' +
           'with different breakpoints in correct order', () =>
        {
          sassaby.standaloneMixin('test-silent')
            .calledWithBlock(
              '@include jigsass-util(test-util, $misc: landscape)' +
              '@include jigsass-util(test-util, $from: s)' +
              '@include jigsass-define-util(test-util) {' +
                'margin-top: if($jigsass-util-modifier, $jigsass-util-modifier * 6px, 6px)' +
              '}'
            )
            .equals(
              '@media(min-width:20em){.test-util--from-s{margin-top:6px}}' +
              '@media(orientation:landscape){.test-util--when-landscape{margin-top:6px}}'
            );
        });
      });
    });
  });

  describe('_block.scss', () => {
    describe('jigsass-define-block [Mixin]', () => {
      it('Creates the correct placeholder selector', () => {
        sassaby.standaloneMixin('jigsass-define-block')
          .calledWithBlockAndArgs(
            '$selector: str-slice(inspect(&), 2);' +
            '@at-root { ' +
              '#{$selector} { k:v }' +
            '}',
            'foo'
          )
          .createsSelector('__jigsass-block-foo')
      });
    });

    describe('jigsass-block [Mixin]', () => {
      it('Generates the correct css', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-block(foo) {' +
              'bar { k:v }' +
            '}' +
            '@include jigsass-block(foo);'
          )
          .equals('* bar{k:v;}');
      });

      it('Does not generates css if called in silent mode', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlockAndArgs(
            '@include jigsass-define-block(foo) {' +
              'bar { k:v }' +
            '}' +
            '@include jigsass-block(foo);',
            true
          )
          .equals('');
      });

      it('Does not generates css if was called in silent mode at some point', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-block(foo) {' +
              'bar { k:v }' +
            '}' +
            '@include jigsass-mute();' +
            '@include jigsass-block(foo);' +
            '@include jigsass-unmute();' +
            '@include jigsass-block(foo);'
          )
          .equals('');
      });

      it('Generates CSS where it block was defined', () => {
        sassaby.standaloneMixin('test-silent')
          .calledWithBlock(
            '@include jigsass-define-block(foo) {' +
              'bar { k: v }' +
            '}' +
            '.baz { kk: vv; }' +
            '@include jigsass-block(foo);'
          )
          .equals('* bar{k:v;}.baz{kk:vv}');
      });
    });
  });
  describe('_component.scss', () => {
    describe('jigsass-component [Mixin]', () => {
      it('Generates styles', () => {
        sassaby.standaloneMixin('jigsass-component')
        .calledWithBlockAndArgs(
          '.test {' +
            'float: left;' +
          '}',
          'test'
        )
        .equals('.test {float: left}');
      });

      it('Generates styles only once at correct location', () => {
        sassaby.standaloneMixin('test-silent')
        .calledWithBlock(
          '@include jigsass-component(test) {' +
            '.test {' +
              'float: left;' +
            '}'+
          '}' +
          '.outside {clear: both;}' +
          '@include jigsass-component(test) {' +
            '.test {' +
              'float: left;' +
            '}'+
          '}'
        )
        .equals('.test {float: left} .outside {clear:both}');
      });

      it('Mutes output when in silent mode', () => {
        sassaby.standaloneMixin('test-silent')
        .calledWithBlock(
          '@include jigsass-mute;' +
          '@include jigsass-component(test) {' +
            '.test {' +
              'float: left;' +
            '}'+
          '}' +
          '@include jigsass-unmute;' +
          '.outside {clear: both;}' +
          '@include jigsass-component(test) {' +
            '.test {' +
              'float: left;' +
            '}'+
          '}'
        )
        .equals('.outside {clear:both}');
      });
    });
  });
});
