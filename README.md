# JigSass Tools Selectors
[![NPM version][npm-image]][npm-url]  [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]   

 > Create predictable, manageable and composable CSS with zero bloat and scalability in mind 

## Installation

Using npm:

```sh
npm i -S jigsass-tools-selectors
```

## Usage

```scss
@import 'path/to/jigsass-tools-selectors';
```

Managing CSS at scale is hard, even very hard. Code bases easily grow out of control,
and dead code elimination is an onerous task.

JigSass Selectors is an attempt to provide tools for better tackling these tasks,
and assisting with defining and generating clean and easy to main CSS based on responsive-enabled 
reusable object and utility classes.

In order to keep a CSS footprint to a minimum, not even a single line of the defined CSS
is generated unless it is explicitly included for use.

Instead of using configuration maps or variables, which eventually become difficult to maintain 
and keep track of, JigSass offers a series of mixins used to enable CSS output where it is used, 
but without creating duplication or changing the cascade.

**Let's take a look at a simplified example:**

```scss
/* _object.media.scss */
@jigsass-define-object(o-media) {
  @include jigsass-classname {
    display: flex;
  }

  @include jigsass-classname($modifer: middle) {
    align-items: center;
  }

  @include jigsass-classname($modifer: reverse) {
    flex-direction: row-reverse;
  }
}

@jigsass-define-object(o-media__item) {
  @include jigsass-classname($modifier: bottom) {
    align-self: flex-end;
  }
} 


/* _component.foo.scss */
.c-foo {
  @include jigsass-object(o-media, $from: large);
  @include jigsass-object(o-media, $from: large, $modifier: middle);

  background-color: #ccc;
}

  .c-foo__fig {
    @include jigsass-util(u-ml, $from: large, $modifier: 1);
    @include jigsass-util(u-mr, $from: large, $modifier: 1);

    background-color: #333;
  }

  // `.foo__fig--bottom` will not actually be generated, as it has no
  // styling of its own.
  .c-foo__fig--bottom {
    @include jigsass-util(u-ml, $from: large, $modifier: 1);
    @include jigsass-object(o-media__item, $from: large, $modifier: bottom);
  }


/* _util.margin.scss */
@include jigsass-define-util(u-mr) {
  $modifier: $jigsass-util-modifier or 0;
  
  margin-right: $jigsass-util-modifier * 12px;
}

@include jigsass-define-util(u-ml) {
  $modifier: $jigsass-util-modifier or 0;
  
  margin-left: $jigsass-util-modifier * 12px;
}


// style.scss
@import 'object.media';   // o-media class will be generated here
@import 'component.foo';
@import 'util.margin';    // u-ml class will be generated here.
```

Will generate:
```css
/* style.css */
@media (min-width: 65em) {
  .o-media--from-large {
    display: flex;
  }

  .o-media--middle--from-large {
    align-items: center;
  }
}

@media (min-width: 65em) {
  .o-media__item--bottom--from-large {
    align-self: bottom;
  }
}

.c-foo {
  background-color: #ccc;
}

  .c-foo__fig {
    background-color: #333;
  }

@media (min-width: 65em) {
  .u-mr--1--from-large {
     margin-right: 12px;
  }
}
@media (min-width: 65em) {
  .u-ml--1--from-large {
     margin-left: 12px;
  }
}
```

Notice how only the styles we actually used ended up in our CSS? How they were generated 
where they were defined, and only once?

When managing the generation of css object and utility classes through config files, it eventually 
becomes damn near impossible to keep track of where each class is used, and when it is safe to
remove, often leaving us with codebases that are larger than they need to be.

In contrast, generating the styles by simply including them where they are being used is a lot 
easier to grasp and manage, while still keeping our CSS stringent and modular.

Now, with the above CSS and following html:
```html
<article class="[ o-media--from-large  o-media--middle--from-large ]  c-foo">
  <figure class="c-foo__fig  u-mr--1--from-large">
    <!-- img1 here -->  
  </figure>
  <div>
    <!-- content here -->
  </div>
  <figure class="o-media__item--bottom--from-large  c-foo__fig  u-ml--1--from-large">
    <!-- img2 here -->  
  </figure>
</articel>
```

We can get something like this:
```
┌─────────────╥╥─────────────────────────────╥╥─────────────┐
│############ ║║CONTENT HEAD                 ║║             │
│############ ║║                             ║║             │
│############ ║║ minus saepe sequi velit a,  ║║ ############│
│##  IMG1  ## ║║ sit veniam quia quibusdam   ║║ ############│
│############ ║║ odio itaque non! Dolores    ║║ ############│
│############ ║║ deserunt atque repudiandae  ║║ ##  IMG2  ##│
│############ ║║ asperiores rerum velit      ║║ ############│
│             ║║ magnam deleniti deleniti    ║║ ############│
│             ║║ sed aspernatur commodi?     ║║ ############│
└─────────────╨╨─────────────────────────────╨╨─────────────┘
```

The `jigsass-object` and `jigsass-util` mixins will generate selectors according to the following 
logic:

```scss
.class-name[--modifier][-[-from-{breakpoint-name}][-until-{breakpoint-name}][-misc-{breakpoint-name}]]
```

Please check the full [documentation](https://TxHawks.github.io/jigsass-tools-selectors) for
a better understanding of how to use `jigsass-tools-mq`.

## Development

It is a best practice for JigSass modules to *not* automatically generate css on `@import`, but 
rather have to user explicitly enable the generation of specific styles from the module.

Contributions in the form of pull-requests, issues, bug reports, etc. are welcome.
Please feel free to fork, hack or modify JigSass Tools Selectors in any way you see fit.

#### Writing documentation

Good documentation is crucial for scalability and maintainability. When contributing,
please do make sure that all Sass functionality (functions, mixins, 
variables and placeholder selectors) is well documented.

Documentation is auto-generated using [SassDoc](http://sassdoc.com/)

#### Running tests
`gulp lint` will, well, lint the contents scss files in the `scss` directory.

`gulp test` with run module's test using Mocha and Sassaby.

`gulp tdd` will watch both the Sass files and the test specs for changes, and will
run tests automatically upon them.

#### Writing tests

JigSass Tools Selectors tests are written using [Sassaby](https://github.com/ryanbahniuk/sassaby)
and Mocha. Spec files are located in the `test` directory.

Mocha allows us to place a call to `before()` in the root of any test file and it 
will be run once, before all the other tests in every `test_*.js` file. 
We can also `require()` files and assign them to the global object to make them 
available to all `test_*.js` files. 

jigsass-tools-selectors uses a file called `helper.js` can be used to set up mocha 
globals requires and `before()`.

In addition to Sassaby's testing functions, jigsass-tools-selectors makes a few Sass
functions available to the test suite, for use inside Sassaby tests:

<dl>
  <dt>jig-var-equals($value, $var) -> {boolean}<dt>
  <dd>
		Check if a variable equals a value.<br />
		<strong>$value</strong> {*}: A value to compare the value of $var to.<br />
		<strong>$var</strong> {*}: The variable to test<br />
	</dd>
  <dt>jig-var-type-is($type, $var) -> {boolean}<dt>
  <dd>
		Check if a variable is of a certain type.<br />
		<strong>$type</strong> {string}: A type to compare with the type of $var.<br />
		<strong>$var</strong> {*}: The variable to test<br />
	</dd>
  <dt>jig-map-key-equals($value, $map, $keys...) -> {boolean}<dt>
  <dd>
		Check if a map's key is assigned a cerain value.<br />
		<strong>$value</strong> {*}:  A value to compare the value of a key in $map with.<br />
		<strong>$map</strong> {map}: The map to test.<br />
		<strong>$keys... </strong> {arglist}: A recursive chain of keys.<br />
	</dd>
  <dt>jig-map-key-type-is($type, $map, keys...) -> {boolean}<dt>
  <dd>
		Check if a map's key is of a certain type<br />
		<strong>$type</strong> {string}: A type to compare with the type of $var.<br />
		<strong>$map</strong> {map}: The map to test.<br />
		<strong>$keys... </strong> {arglist}: A recursive chain of keys.<br />
	</dd>
</dl>


## File structure
```bash
┬ ./
│
├─┬ scss/ 
│ └─ index.scss # The module's importable file.
│
├── sassdoc/    # Generated documentation 
│               # of the module's sass features
│
└─┬─ test/
  │
  ├─┬ helpers/
  │ │
  │ ├── importer.scss       # Used for easilty importing tested scss files
  │ │
  │ └── _test_helpers.scss  # JigSass's assertion helpers,
  │                         # for use inside Sassaby tests.
  │                         
  ├── helper.js             # Used for defining global `before()`
  │                         # functions and requiring modules.
  │                         
  └── test_jigsass-tools-selectors  # Specs. Mocha will automatically 
                                    # run all javascript files located
                                    # in the `test` directory.
```

**License:** MIT



[npm-image]: https://badge.fury.io/js/jigsass-tools-selectors.svg
[npm-url]: https://npmjs.org/package/jigsass-tools-selectors

[travis-image]: https://travis-ci.org/TxHawks/jigsass-tools-selectors.svg?branch=master
[travis-url]: https://travis-ci.org/TxHawks/jigsass-tools-selectors
[daviddm-image]: https://david-dm.org/TxHawks/jigsass-tools-selectors.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/TxHawks/jigsass-tools-selectors
