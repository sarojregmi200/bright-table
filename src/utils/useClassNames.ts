import { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { prefix as addPrefix } from './prefix';
import TableContext from '../TableContext';

export type ClassValue =
    | string
    | number
    | ClassDictionary
    | ClassArray
    | undefined
    | null
    | boolean;

// This is the only way I found to break circular references between ClassArray and ClassValue
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540

export interface ClassArray extends Array<ClassValue> { } //eslint-disable-line @typescript-eslint/no-empty-interface

interface ClassNameUtils {
    withClassPrefix: (...classes: ClassValue[]) => string;
    merge: (...classes: ClassValue[]) => string;
    prefix: (...classes: ClassValue[]) => string;
    rootPrefix: (...classes: ClassValue[]) => string;
}

export interface ClassDictionary {
    [id: string]: any;
}
/**
 * Add a prefix to all classNames.
 *
 * @param str prefix of className
 * @returns { withClassPrefix, merge, prefix }
 *  - withClassPrefix: A function of combining className and adding a prefix to each className.
 *    At the same time, the default `classPrefix` is the first className.
 *  - merge: A merge className function.
 *  - prefix: Add a prefix to className
 *  - rootPrefix
 */
function useClassNames(str: string, controlled?: boolean): ClassNameUtils {
    const { classPrefix: contextClassPrefix = 'bright' } = useContext(TableContext) || {};
    const componentName = controlled ? str : addPrefix(contextClassPrefix, str);

    /**
     * @example
     *
     * if str = 'button':
     * prefix('red', { active: true }) => 'bright-button-red bright-button-active'
     */
    const prefix = useCallback(
        (...classes: ClassValue[]) => {
            const mergeClasses = classes.length
                ? classNames(...classes)
                    .split(' ')
                    .map(item => addPrefix(componentName, item))
                : [];

            return mergeClasses.filter(cls => cls).join(' ');
        },
        [componentName]
    );

    /**
     * @example
     *
     * if str = 'button':
     * withClassPrefix('red', { active: true }) => 'bright-button bright-button-red bright-button-active'
     */
    const withClassPrefix = useCallback(
        (...classes: ClassValue[]) => {
            const mergeClasses = prefix(classes);
            return mergeClasses ? `${componentName} ${mergeClasses}` : componentName;
        },
        [componentName, prefix]
    );

    /**
     * @example
     * rootPrefix('btn') => 'bright-btn'
     * rootPrefix('btn', { active: true }) => 'bright-btn bright-active'
     */
    const rootPrefix = (...classes: ClassValue[]) => {
        const mergeClasses = classes.length
            ? classNames(...classes)
                .split(' ')
                .map(item => addPrefix(contextClassPrefix, item))
            : [];

        return mergeClasses.filter(cls => cls).join(' ');
    };

    return {
        withClassPrefix,
        merge: classNames,
        prefix,
        rootPrefix
    };
}

export default useClassNames;
